---
{"dg-publish":true,"dg-path":"模型部署/Deepseek-OCR-API.md","tags":["Code"],"permalink":"/模型部署/Deepseek-OCR-API/","dgPassFrontmatter":true,"noteIcon":"","created":"2025-11-14T16:52:36.419+08:00","updated":"2025-11-17T15:58:56.447+08:00"}
---


### 简要说明
#### 1. 路径处理接口 (n8n/自动化专用)
- 路径: POST /ocr/process_path
- 用途: 为服务器端的自动化流程设计, 例如给 n8n 或其他脚本调用. 它处理的是已经存在于服务器上的文件.
- 输入: 一个 JSON 对象, 包含:
   - input_path: 服务器上源文件的绝对路径.
   - output_path: 服务器上用于存放结果文件夹的绝对路径.
   - webhook_url (可选): 任务完成后, API 会向这个 URL 发送一个包含结果信息的 POST 请求.
   - config (可选): 可自定义 OCR 的 prompt, PDF 页码范围等.
- 输出:
   - 即时响应: 立刻返回 {"status": "processing_started"} , 表示任务已接收并在后台开始处理.
   - 最终结果: 结果会以文件形式 (标注图, Markdown, 裁剪图等) 保存到你指定的 output_path 中. 如果提供了 webhook_url, 任务完成后会收到一个详细的回调通知.
- 特点: 异步后台处理, 适合处理大文件, 不会因为处理时间长而导致 HTTP 请求超时.

#### 2. 文件上传接口 (测试/简单应用专用)
- 路径: POST /ocr/process_upload
- 用途: 用于快速、交互式的测试. 允许客户端直接通过 HTTP 请求上传文件.
- 输入: multipart/form-data 格式, 包含:
   - file: 你要上传的图片或 PDF 文件.
   - config_json (可选): 一个 JSON 字符串, 用于自定义 OCR 配置.
- 输出: 一个 JSON 对象, 包含识别出的纯文本结果, 格式为 ` {"results": [{"page_number": ..., "text": "..."}, ...]}.`
- 特点: 同步处理, 上传后立即返回结果. 但只返回最基本的文本信息, 不生成图片, 也不保存任何文件.

#### 3. 模型列表接口
- 路径: GET /v1/models
- 用途: 唯一的作用就是告诉像 Open-WebUI 这样的客户端 "我这里有一个可用的模型".
- 输入: 无.
- 输出: 一个固定的 JSON 对象, 声明它提供一个名为 deepseek-ocr 的模型.
- 特点: 模拟 OpenAI 的标准接口, 是为了让前端应用能够识别并连接到此服务.

#### 4. 聊天接口 (聊天界面的核心)
- 路径: POST /v1/chat/completions
- 用途: 为 Open-WebUI 这样的聊天界面提供图文并茂的、功能最丰富的 OCR 体验.
- 输入: OpenAI 格式的 JSON 对象, 其中 messages 数组的最后一条消息应包含图片 (以 Base64 形式) 和可选的文字 prompt.
- 输出:
   - 丰富内容: 返回一个精心构造的 Markdown 文本. 其中包括:
	   1. 模型识别出的主要文本内容.
	   2. 穿插在文本中的、指向裁剪后小图的 Markdown 图片链接.
	   3. 在内容末尾, 附上一个指向完整标注大图的 Markdown 图片链接.
   - 文件产物: 作为"副作用", 所有生成的图片 (大图和小图) 和一个纯文本的 Markdown 文件都会被自动保存到服务器的 /home/nonlinear/DeepSeek-OCR/OCR 目录下.
- 特点: 这是功能的核心. 它不仅执行 OCR, 还进行版面分析, 保存结果, 并通过 URL 的方式返回一个丰富的、可交互的响应.

#### 5. 静态文件服务 (Open-WebUI 的图像存储)
- 路径: GET /outputs/{文件路径}
- 用途: 这是一个支撑性服务, 是让聊天接口能够成功显示图片的关键.
- 输入: 一个指向 /outputs/ 路径的 GET 请求, 例如浏览器请求 http://localhost:8000/outputs/images/chat_..._0.jpg.
- 输出: 对应的图片文件本身.
- 特点: 它将服务器上的 /home/nonlinear/DeepSeek-OCR/OCR 文件夹"开放"出来, 使得浏览器可以通过 http://.../outputs/
这个 URL 前缀访问到里面的任何文件, 从而加载聊天记录中的图片.



### API 代码 (稍微完善)
修改 PDF 的处理逻辑, [[Deepseek-OCR\|Deepseek-OCR]]

```python 
import os
import io
import json
import re
import uuid
import time
import base64
import logging
import requests
import ast
from typing import List, Optional, Dict, Union, Literal, Tuple

import torch
import fitz  # PyMuPDF
import numpy as np
import img2pdf
from PIL import Image, ImageDraw, ImageFont
from fastapi import FastAPI, UploadFile, Form, HTTPException, BackgroundTasks, Body
from fastapi.staticfiles import StaticFiles
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, Extra

# =================== Logging Setup ===================
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')


# =================== Environment and VLLM Setup ===================
# Set environment variables before importing VLLM
os.environ['VLLM_USE_V1'] = '0'
os.environ["CUDA_VISIBLE_DEVICES"] = '0'

from vllm import LLM, SamplingParams
from vllm.model_executor.models.registry import ModelRegistry
from deepseek_ocr import DeepseekOCRForCausalLM
from process.image_process import DeepseekOCRProcessor
from process.ngram_norepeat import NoRepeatNGramLogitsProcessor
from config import MODEL_PATH, CROP_MODE, PROMPT as DEFAULT_PROMPT

# Define the output directory for chat-based completions
CHAT_OUTPUT_DIR = "/home/nonlinear/DeepSeek-OCR/OCR"
# The base URL where this backend is accessible. Used to construct absolute URLs for images.
BACKEND_BASE_URL = "http://localhost:8000"

# Register the custom model with VLLM
ModelRegistry.register_model("DeepseekOCRForCausalLM", DeepseekOCRForCausalLM)


# =================== Pydantic Models for API Configuration ===================

# --- Models for path-based and upload-based OCR ---
class VLLMSamplingParams(BaseModel):
    temperature: float = Field(0.0, ge=0.0, le=1.0)
    max_tokens: int = Field(4096, gt=0)

class PdfConfig(BaseModel):
    first_page: Optional[int] = Field(None)
    last_page: Optional[int] = Field(None)

class OCRConfig(BaseModel):
    prompt: str = Field(DEFAULT_PROMPT)
    sampling_params: VLLMSamplingParams = Field(default_factory=VLLMSamplingParams)
    pdf_config: Optional[PdfConfig] = Field(default_factory=PdfConfig)

class PathProcessingRequest(BaseModel):
    input_path: str = Field(..., description="Absolute path to the input file on the server.")
    output_path: str = Field(..., description="Absolute path to the output directory to save results.")
    webhook_url: Optional[str] = Field(None, description="Optional webhook URL to send a POST request to upon completion.")
    config: OCRConfig = Field(default_factory=OCRConfig)

# --- Models for OpenAI Compatibility (Open-WebUI) ---
class TextPart(BaseModel):
    type: Literal["text"]
    text: str

class ImageUrlPart(BaseModel):
    type: Literal["image_url"]
    image_url: Dict[str, str]

class Message(BaseModel):
    role: Literal["system", "user", "assistant"]
    content: Union[str, List[Union[TextPart, ImageUrlPart]]]

class ChatCompletionReq(BaseModel):
    model: str = "deepseek-ocr"
    messages: List[Message]
    temperature: Optional[float] = 0.3
    max_tokens: Optional[int] = 4096
    stream: bool = False
    class Config:
        extra = Extra.allow

# Models for non-streaming response
class UsageInfo(BaseModel):
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int

class ChatCompletionMessage(BaseModel):
    role: Literal["assistant"] = "assistant"
    content: str

class Choice(BaseModel):
    index: int
    message: ChatCompletionMessage
    finish_reason: Optional[str] = None
    logprobs: Optional[None] = None

class ChatCompletionResp(BaseModel):
    id: str = Field(default_factory=lambda: f"chatcmpl-{uuid.uuid4()}")
    object: str = "chat.completion"
    created: int = Field(default_factory=lambda: int(time.time()))
    model: str
    choices: List[Choice]
    usage: UsageInfo
    system_fingerprint: Optional[str] = "fp_deepseek_ocr_v1"

# Models for streaming response
class DeltaMessage(BaseModel):
    role: Optional[Literal["assistant"]] = None
    content: Optional[str] = None

class ChatCompletionChoiceDelta(BaseModel):
    index: int
    delta: DeltaMessage
    finish_reason: Optional[str] = None
    logprobs: Optional[None] = None

class ChatCompletionChunk(BaseModel):
    id: str
    object: str = "chat.completion.chunk"
    created: int
    model: str
    choices: List[ChatCompletionChoiceDelta]
    system_fingerprint: Optional[str] = "fp_deepseek_ocr_v1"
    usage: Optional[UsageInfo] = Field(None, description="Usage stats for the entire request, present in the final chunk.")


# =================== FastAPI App and Global Objects ===================

app = FastAPI(
    title="Enhanced DeepSeek-OCR API", 
    version="3.2.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# --- CORS Middleware Configuration ---
# This allows the HTML frontend (served from a file:// URL or other origins)
# to communicate with the backend server.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, OPTIONS, etc.)
    allow_headers=["*"],  # Allows all headers
)

# Mount the OCR output directory to be served statically at the /outputs path
os.makedirs(CHAT_OUTPUT_DIR, exist_ok=True)
app.mount("/outputs", StaticFiles(directory=CHAT_OUTPUT_DIR), name="outputs")

logging.info("🚀 Initializing VLLM Engine... (This may take a moment)")
llm = LLM(
    model=MODEL_PATH,
    hf_overrides={"architectures": ["DeepseekOCRForCausalLM"]},
    block_size=256,
    enforce_eager=False,
    trust_remote_code=True,
    max_model_len=4096,
    max_num_seqs=2,
    gpu_memory_utilization=0.95,
    disable_mm_preprocessor_cache=True,
    dtype="float16"
)

# llm = LLM(
#     model=MODEL_PATH,
#     hf_overrides={"architectures": ["DeepseekOCRForCausalLM"]},
#     block_size=256,
#     enforce_eager=False,
#     trust_remote_code=True,
#     max_model_len=4096,
#     max_num_seqs=16,
#     gpu_memory_utilization=0.95,
#     disable_mm_preprocessor_cache=True,
#     dtype="float16"
# )
logging.info("✅ VLLM Engine Initialized.")

#ocr_processor = DeepseekOCRProcessor()

# Explicitly load the tokenizer, disabling the "fast" version to ensure
# correct handling of Chinese characters, which can be buggy in some fast tokenizers.
logging.info("Loading tokenizer with use_fast=False...")
from transformers import AutoTokenizer
tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH, use_fast=False)
# Pass the explicitly loaded tokenizer to the processor.
ocr_processor = DeepseekOCRProcessor(tokenizer=tokenizer)



logging.info("✅ DeepSeek-OCR Processor Initialized.")


# =================== Helper Functions ===================

def cleanup_model_output(text: str) -> str:
    """Removes raw model tags from the output for a cleaner response."""
    # This pattern finds all occurrences of the ref/det tags.
    pattern = r'(<\|ref\|>.*?<\|/ref\|><\|det\|>.*?<\|/det\|>)'
    cleaned_text = re.sub(pattern, '', text, flags=re.DOTALL)
    # Also remove the end of sentence token
    cleaned_text = cleaned_text.replace('<｜end of sentence｜>', '').strip()
    return cleaned_text

def get_images_from_path(input_path: str, pdf_config: PdfConfig) -> Tuple[List[Image.Image], int]:
    """
    Gets a list of PIL images from a local file path (image or PDF).
    Returns a tuple of (list_of_images, actual_start_page).
    For single images, actual_start_page is 1.
    """
    if not os.path.exists(input_path):
        raise FileNotFoundError(f"Input file not found at: {input_path}")

    _, extension = os.path.splitext(input_path)
    extension = extension.lower()

    if extension == ".pdf":
        logging.info(f"Reading PDF from path: {input_path}")
        with open(input_path, "rb") as f:
            pdf_bytes = f.read()
        # pdf_to_images now returns a tuple
        return pdf_to_images(pdf_bytes, pdf_config.first_page, pdf_config.last_page)
    elif extension in [".png", ".jpg", ".jpeg", ".bmp", ".webp"]:
        logging.info(f"Reading image from path: {input_path}")
        return [Image.open(input_path).convert("RGB")], 1
    else:
        raise ValueError(f"Unsupported file extension: {extension}")

def pdf_to_images(pdf_bytes: bytes, first_page: Optional[int], last_page: Optional[int], dpi: int = 300) -> Tuple[List[Image.Image], int]:
    """
    Converts a PDF file in bytes to a list of PIL images with detailed logging and custom page range logic.
    Returns a tuple of (list_of_images, actual_start_page).
    """
    images = []
    try:
        logging.info("Opening PDF document from bytes...")
        pdf_document = fitz.open(stream=pdf_bytes, filetype="pdf")
    except Exception as e:
        logging.error(f"Failed to open PDF with PyMuPDF: {e}")
        raise

    total_pages = pdf_document.page_count
    logging.info(f"PDF has {total_pages} pages. Requested range: {first_page}-{last_page}")

    # Determine the page range based on user's flexible logic
    user_start = first_page if first_page is not None else 1
    user_end = last_page if last_page is not None else total_pages

    actual_start = user_start
    actual_end = user_end

    # Apply user's custom fallback logic
    if user_start > total_pages or user_start > user_end:
        logging.warning(f"Invalid page range detected (start={user_start}, end={user_end}, total={total_pages}). Defaulting to read all pages.")
        actual_start = 1
        actual_end = total_pages

    # Convert to 0-based index for fitz library
    start_index = actual_start - 1
    end_index = min(actual_end, total_pages)

    if start_index >= end_index:
        logging.warning(f"Calculated invalid page range: start index {start_index} is not before end index {end_index}. No pages will be processed.")
        pdf_document.close()
        return [], 1 # Return empty list and default start page 1

    logging.info(f"Processing pages from {actual_start} to {end_index}.")

    zoom = dpi / 72.0
    matrix = fitz.Matrix(zoom, zoom)

    for page_num in range(start_index, end_index):
        logging.info(f"Rendering page {page_num + 1}...")
        try:
            page = pdf_document[page_num]
            pixmap = page.get_pixmap(matrix=matrix, alpha=False)
            img_data = pixmap.tobytes("png")
            images.append(Image.open(io.BytesIO(img_data)).convert("RGB"))
            logging.info(f"Successfully rendered page {page_num + 1}.")
        except Exception as e:
            logging.error(f"Failed to render page {page_num + 1}: {e}")
            # Continue to next page if one page fails
            continue
    
    pdf_document.close()
    logging.info(f"Finished PDF processing. Extracted {len(images)} images.")
    return images, actual_start


def re_match(text):
    """Extracts structured data references from OCR text."""
    pattern = r'(<\|ref\|>(.*?)<\|/ref\|><\|det\|>(.*?)<\|/det\|>)'
    matches = re.findall(pattern, text, re.DOTALL)

    mathes_image = []
    mathes_other = []
    for a_match in matches:
        if '<|ref|>image<|/ref|>' in a_match[0]:
            mathes_image.append(a_match)
        else:
            mathes_other.append(a_match)
    return matches, mathes_image, mathes_other


def extract_coordinates_and_label(ref_text, image_width, image_height):
    """Extracts label and coordinates from a reference."""
    try:
        label_type = ref_text[1]
        # Using ast.literal_eval for safe evaluation
        cor_list = ast.literal_eval(ref_text[2])
        # Basic validation: ensure it's a list (or list of lists)
        if not isinstance(cor_list, list):
            return None
        return (label_type, cor_list)
    except (ValueError, SyntaxError, TypeError) as e:
        # Silently handle expected parsing errors from literal_eval
        # This prevents log flooding for malformed or empty coordinate strings
        return None
    except Exception as e:
        # Log other unexpected errors
        logging.error(f"Unexpected error extracting coordinates: {e}")
        return None


def draw_bounding_boxes_and_save_crops(image, refs, page_num, output_dir, is_pdf, base_filename):
    """Draws bounding boxes on an image and saves cropped sub-images."""
    image_width, image_height = image.size
    img_draw = image.copy()
    draw = ImageDraw.Draw(img_draw)

    overlay = Image.new('RGBA', img_draw.size, (0, 0, 0, 0))
    draw2 = ImageDraw.Draw(overlay)
    
    try:
        font = ImageFont.load_default()
    except IOError:
        font = ImageFont.load_default()

    images_dir = os.path.join(output_dir, "images")
    os.makedirs(images_dir, exist_ok=True)
    
    img_idx = 0
    
    for i, ref in enumerate(refs):
        try:
            result = extract_coordinates_and_label(ref, image_width, image_height)
            if result:
                label_type, points_list = result
                
                color = (np.random.randint(0, 200), np.random.randint(0, 200), np.random.randint(0, 255))
                color_a = color + (20, )

                for points in points_list:
                    x1, y1, x2, y2 = points
                    x1 = int(x1 / 999 * image_width)
                    y1 = int(y1 / 999 * image_height)
                    x2 = int(x2 / 999 * image_width)
                    y2 = int(y2 / 999 * image_height)

                    if label_type == 'image':
                        try:
                            cropped = image.crop((x1, y1, x2, y2))
                            img_name = f"{base_filename}_{page_num}_{img_idx}.jpg" if is_pdf else f"{base_filename}_{img_idx}.jpg"
                            cropped.save(os.path.join(images_dir, img_name))
                        except Exception as e:
                            logging.error(f"Error saving cropped image: {e}")
                        img_idx += 1
                        
                    try:
                        width = 4 if label_type == 'title' else 2
                        draw.rectangle([x1, y1, x2, y2], outline=color, width=width)
                        draw2.rectangle([x1, y1, x2, y2], fill=color_a, outline=(0, 0, 0, 0), width=1)

                        text_x = x1
                        text_y = max(0, y1 - 15)
                            
                        text_bbox = draw.textbbox((text_x, text_y), label_type, font=font)
                        text_width = text_bbox[2] - text_bbox[0]
                        text_height = text_bbox[3] - text_bbox[1]
                        draw.rectangle([text_x, text_y, text_x + text_width, text_y + text_height], fill=(255, 255, 255, 30))
                        draw.text((text_x, text_y), label_type, font=font, fill=color)
                    except Exception as e:
                        logging.error(f"Error drawing bounding box: {e}")
        except Exception as e:
            logging.error(f"Error processing ref: {e}")
            continue
            
    img_draw.paste(overlay, (0, 0), overlay)
    return img_draw


def pil_to_pdf_img2pdf(pil_images, output_path):
    """Converts a list of PIL images to a single PDF file."""
    if not pil_images:
        return
    
    image_bytes_list = []
    for img in pil_images:
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        img_buffer = io.BytesIO()
        img.save(img_buffer, format='JPEG', quality=95)
        image_bytes_list.append(img_buffer.getvalue())
    
    try:
        pdf_bytes = img2pdf.convert(image_bytes_list)
        with open(output_path, "wb") as f:
            f.write(pdf_bytes)
    except Exception as e:
        logging.error(f"Error converting images to PDF: {e}")


def _extract_image_from_uri(uri: str) -> Optional[Image.Image]:
    """Extracts a PIL image from a data URI."""
    if not uri:
        return None
    
    # Regex to find base64 content in a data URI.
    # It looks for `base64,` and captures everything after it.
    # This is more robust than matching the full `data:image/...` prefix.
    match = re.search(r"base64,(.*)", uri)
    if not match:
        return None
        
    base64_str = match.group(1)
    try:
        image_bytes = base64.b64decode(base64_str)
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        return image
    except Exception as e:
        logging.warning(f"Found base64 data but failed to decode/open image: {e}")
        return None


def _process_single_document(input_path: str, output_path: str, config: OCRConfig) -> Tuple[str, Dict, Optional[str]]:
    """Processes a single document (image or PDF) and returns the result."""
    output_files = {}
    try:
        pdf_config = config.pdf_config or PdfConfig()
        images_to_process, actual_start_page = get_images_from_path(input_path, pdf_config)
        
        if not images_to_process:
            logging.warning(f"No images extracted from {input_path}. Aborting job for this file.")
            return "aborted", {}, "No images could be extracted from the input file."

        user_prompt = config.prompt
        prompt_with_placeholder = f"<image>\n{user_prompt}" if "<image>" not in user_prompt else user_prompt

        sampling_params = SamplingParams(
            temperature=config.sampling_params.temperature,
            max_tokens=config.sampling_params.max_tokens,
            #logits_processors=[NoRepeatNGramLogitsProcessor(ngram_size=20, window_size=50)],
            repetition_penalty=1.1,
            skip_special_tokens=False,
        )

        os.makedirs(output_path, exist_ok=True)
        is_pdf = input_path.lower().endswith('.pdf')
        base_filename = os.path.splitext(os.path.basename(input_path))[0]
        
        page_suffix = f"_{actual_start_page}-{actual_start_page + len(images_to_process) - 1}" if is_pdf and len(images_to_process) > 0 else ""

        contents_det_parts = []
        contents_parts = []
        draw_images = []

        for i, original_image in enumerate(images_to_process):
            real_page_num = actual_start_page + i
            logging.info(f"Processing page {real_page_num} / {actual_start_page + len(images_to_process) - 1}...")

            single_batch_input = [{
                "prompt": prompt_with_placeholder,
                "multi_modal_data": {"image": ocr_processor.tokenize_with_images(images=[original_image], conversation=prompt_with_placeholder, bos=True, eos=True, cropping=CROP_MODE)},
            }]
            
            # Generate for a single page
            output = llm.generate(single_batch_input, sampling_params)[0]
            raw_text = output.outputs[0].text
            
            page_separator = f'\n\n<--- Page {real_page_num} --->\n\n'
            contents_det_parts.append(raw_text)

            matches_ref, matches_images, matches_other = re_match(raw_text)
            
            annotated_image = draw_bounding_boxes_and_save_crops(
                original_image, matches_ref, real_page_num, output_path, is_pdf, base_filename
            )
            draw_images.append(annotated_image)

            processed_text = raw_text
            for idx, match_image in enumerate(matches_images):
                img_name = f"{base_filename}_{real_page_num}_{idx}.jpg" if is_pdf else f"{base_filename}_{idx}.jpg"
                processed_text = processed_text.replace(match_image[0], f'![](images/{img_name})\n')
            
            for match_other in matches_other:
                processed_text = processed_text.replace(match_other[0], '')
            
            processed_text = processed_text.replace('<｜end of sentence｜>', '').replace('\\coloneqq', ':=').replace('\\eqqcolon', '=:').replace('\n\n\n\n', '\n\n').replace('\n\n\n', '\n\n')
            contents_parts.append(processed_text)

            # Aggressively clear cache after processing each page
            if torch.cuda.is_available():
                torch.cuda.empty_cache()

        # Join all processed parts
        contents_det = page_separator.join(contents_det_parts)
        contents = page_separator.join(contents_parts)

        det_output_filename = os.path.join(output_path, f"{base_filename}{page_suffix}_det.md")
        with open(det_output_filename, "w", encoding="utf-8") as f:
            f.write(contents_det.strip())
        output_files["detailed_markdown"] = det_output_filename

        md_output_filename = os.path.join(output_path, f"{base_filename}{page_suffix}.md")
        with open(md_output_filename, "w", encoding="utf-8") as f:
            f.write(contents.strip())
        output_files["processed_markdown"] = md_output_filename

        if is_pdf:
            pdf_out_path = os.path.join(output_path, f"{base_filename}{page_suffix}_layouts.pdf")
            pil_to_pdf_img2pdf(draw_images, pdf_out_path)
            logging.info(f"✅ Saved annotated PDF to: {pdf_out_path}")
            output_files["annotated_pdf"] = pdf_out_path
        elif draw_images:
            img_out_path = os.path.join(output_path, f"{base_filename}_layout.jpg")
            draw_images[0].save(img_out_path)
            logging.info(f"✅ Saved annotated image to: {img_out_path}")
            output_files["annotated_image"] = img_out_path

        logging.info(f"✅ Job finished for {input_path}. Outputs saved in: {output_path}")
        return "success", output_files, None

    except Exception as e:
        error_message = str(e)
        logging.error(f"❌ Error processing {input_path}: {e}", exc_info=True)
        return "error", output_files, error_message


def do_path_processing(req: PathProcessingRequest):
    """
    The actual long-running task for path-based processing.
    It can handle a single file or a directory of PDF files.
    Includes webhook callback logic.
    """
    try:
        if os.path.isdir(req.input_path):
            # --- Directory Processing Logic ---
            logging.info(f"Input path is a directory. Scanning for PDF files in: {req.input_path}")
            
            try:
                pdf_files = sorted([f for f in os.listdir(req.input_path) if f.lower().endswith('.pdf')])
            except FileNotFoundError:
                logging.error(f"Input directory not found: {req.input_path}")
                if req.webhook_url:
                    requests.post(req.webhook_url, json={
                        "status": "error", "error": "Input directory not found.", "input_path": req.input_path
                    }, timeout=10)
                return

            if not pdf_files:
                logging.warning(f"No PDF files found in directory: {req.input_path}")
                if req.webhook_url:
                     requests.post(req.webhook_url, json={
                        "status": "completed_empty", "message": "No PDF files found to process.", "input_path": req.input_path
                    }, timeout=10)
                return

            logging.info(f"Found {len(pdf_files)} PDF files to process.")
            
            all_results = []
            overall_status = "success"

            for pdf_file in pdf_files:
                file_input_path = os.path.join(req.input_path, pdf_file)
                pdf_base_name = os.path.splitext(pdf_file)[0]
                file_output_path = os.path.join(req.output_path, pdf_base_name)
                
                logging.info(f"--- Starting processing for sub-task: {file_input_path} ---")
                
                status, output_files, error_message = _process_single_document(
                    input_path=file_input_path,
                    output_path=file_output_path,
                    config=req.config
                )
                
                all_results.append({
                    "input_path": file_input_path,
                    "output_path": file_output_path,
                    "status": status,
                    "output_files": output_files,
                    "error": error_message
                })
                
                if status == "error":
                    overall_status = "partial_success"
            
            logging.info(f"Finished processing all files in directory: {req.input_path}")
            
            if req.webhook_url:
                logging.info(f"Sending directory-level webhook to: {req.webhook_url}")
                try:
                    payload = {
                        "status": overall_status,
                        "input_path": req.input_path,
                        "output_path": req.output_path,
                        "processed_files": all_results,
                        "timestamp": time.time()
                    }
                    requests.post(req.webhook_url, json=payload, timeout=10)
                    logging.info("✅ Directory webhook sent.")
                except Exception as e:
                    logging.error(f"❌ Failed to send directory webhook to {req.webhook_url}: {e}", exc_info=True)

        else:
            # --- Single File Processing Logic ---
            logging.info(f"Starting background job for single file: {req.input_path}")
            status, output_files, error_message = _process_single_document(
                input_path=req.input_path,
                output_path=req.output_path,
                config=req.config
            )

            if req.webhook_url:
                logging.info(f"Sending single-file webhook to: {req.webhook_url}")
                try:
                    payload = {
                        "status": status,
                        "input_path": req.input_path,
                        "output_path": req.output_path,
                        "output_files": output_files,
                        "error": error_message,
                        "timestamp": time.time()
                    }
                    requests.post(req.webhook_url, json=payload, timeout=10)
                    logging.info("✅ Single-file webhook sent.")
                except Exception as e:
                    logging.error(f"❌ Failed to send webhook callback to {req.webhook_url}: {e}", exc_info=True)

    except Exception as e:
        # This is a catch-all for unexpected errors in the dispatcher logic itself.
        logging.error(f"❌ A critical error occurred in the path processing dispatcher: {e}", exc_info=True)
        if req.webhook_url:
            try:
                requests.post(req.webhook_url, json={
                    "status": "critical_error",
                    "error": str(e),
                    "input_path": req.input_path,
                    "timestamp": time.time()
                }, timeout=10)
            except Exception as webhook_e:
                logging.error(f"❌ Failed to send critical error webhook: {webhook_e}")

    finally:
        # Force clear CUDA cache once at the end of the entire job (single or batch)
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
            logging.info("CUDA cache cleared after path processing job.")


# =================== API Endpoints ===================

# --- Endpoint for n8n and file-based automation ---
@app.post("/ocr/process_path")
async def ocr_process_path(request: PathProcessingRequest, background_tasks: BackgroundTasks):
    background_tasks.add_task(do_path_processing, request)
    return {"status": "processing_started", "input_path": request.input_path, "output_path": request.output_path}

# --- Endpoint for interactive file uploads ---
@app.post("/ocr/process_upload")
async def ocr_process_upload(file: UploadFile, config_json: str = Form('{}')):
    try:
        try:
            config = OCRConfig.parse_obj(json.loads(config_json))
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid config_json: {e}")

        file_content = await file.read()
        images_to_process = []
        actual_start_page = 1 # Default for single images or if PDF processing fails before returning a start page

        if file.content_type == "application/pdf":
            try:
                # pdf_to_images now returns a tuple (images, actual_start_page)
                images_to_process, actual_start_page = pdf_to_images(file_content, config.pdf_config.first_page, config.pdf_config.last_page)
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Failed to process PDF: {e}")
        elif file.content_type and file.content_type.startswith("image/"):
            images_to_process.append(Image.open(io.BytesIO(file_content)).convert("RGB"))
        else:
            raise HTTPException(status_code=415, detail=f"Unsupported file type: {file.content_type}")

        if not images_to_process:
            raise HTTPException(status_code=400, detail="No images could be extracted from the uploaded file.")

        # Correctly format the prompt to ensure exactly one <image> placeholder
        user_prompt = config.prompt
        if "<image>" not in user_prompt:
            prompt_with_placeholder = f"<image>\n{user_prompt}"
        else:
            prompt_with_placeholder = user_prompt

        batch_inputs = [{"prompt": prompt_with_placeholder, "multi_modal_data": {"image": ocr_processor.tokenize_with_images(images=[img], conversation=prompt_with_placeholder, bos=True, eos=True, cropping=CROP_MODE)}} for img in images_to_process]
        
        sampling_params = SamplingParams(temperature=config.sampling_params.temperature, max_tokens=config.sampling_params.max_tokens, skip_special_tokens=False)
        #sampling_params = SamplingParams(temperature=config.sampling_params.temperature, max_tokens=config.sampling_params.max_tokens, logits_processors=[NoRepeatNGramLogitsProcessor(ngram_size=20, window_size=50)], skip_special_tokens=False)
        outputs = llm.generate(batch_inputs, sampling_params)

        results = []
        # Use the actual_start_page for correct labeling
        for i, output in enumerate(outputs):
            raw_text = output.outputs[0].text
            cleaned_text = cleanup_model_output(raw_text)
            results.append({
                "page_number": actual_start_page + i,
                "text": cleaned_text
            })
        return {"results": results}
    finally:
        # Force clear CUDA cache to prevent memory fragmentation
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
            logging.info("CUDA cache cleared after upload processing.")

# --- Endpoints for Open-WebUI Compatibility ---
@app.get("/v1/models")
async def list_models():
    return {"object": "list", "data": [{"id": "deepseek-ocr", "object": "model", "created": int(time.time()), "owned_by": "deepseek"}]}

@app.post("/v1/chat/completions")
async def chat_completions(body: ChatCompletionReq):
    image = None
    text_prompt = ""

    if not body.messages:
        raise HTTPException(status_code=400, detail="No messages provided")

    last_msg = body.messages[-1]

    if isinstance(last_msg.content, str):
        text_prompt = last_msg.content
        image = _extract_image_from_uri(text_prompt)
    elif isinstance(last_msg.content, list):
        for part in last_msg.content:
            if part.type == "text":
                text_prompt += part.text
            elif part.type == "image_url":
                if image is not None:
                    logging.warning("Multiple images detected, but only the first one will be used.")
                    continue
                
                image_url_data = part.image_url.get("url")
                image = _extract_image_from_uri(image_url_data)

    if image is None:
        # If no image is found, return a regular chat message asking the user to upload one.
        if body.stream:
            async def stream_error_generator():
                chunk_id = f"chatcmpl-{uuid.uuid4()}"
                created_time = int(time.time())
                error_message = "Please upload an image for OCR processing."
                
                # Chunk 1: Role
                yield f"data: {ChatCompletionChunk(id=chunk_id, created=created_time, model=body.model, choices=[ChatCompletionChoiceDelta(index=0, delta=DeltaMessage(role='assistant'))]).model_dump_json(exclude_none=True)}\n\n"
                
                # Chunk 2: Content
                yield f"data: {ChatCompletionChunk(id=chunk_id, created=created_time, model=body.model, choices=[ChatCompletionChoiceDelta(index=0, delta=DeltaMessage(content=error_message))]).model_dump_json(exclude_none=True)}\n\n"
                
                # Chunk 3: Finish reason
                yield f"data: {ChatCompletionChunk(id=chunk_id, created=created_time, model=body.model, choices=[ChatCompletionChoiceDelta(index=0, delta=DeltaMessage(), finish_reason='stop')]).model_dump_json(exclude_none=True)}\n\n"
                
                yield "data: [DONE]\n\n"
            return StreamingResponse(stream_error_generator(), media_type="text/event-stream")
        else:
            return ChatCompletionResp(model=body.model, choices=[Choice(index=0, message=ChatCompletionMessage(content="Please upload an image for OCR processing."), finish_reason="stop")], usage=UsageInfo(prompt_tokens=0, completion_tokens=0, total_tokens=0))

    # --- Logic to save files and prepare response URL ---
    os.makedirs(CHAT_OUTPUT_DIR, exist_ok=True)
    base_filename = f"chat_{uuid.uuid4().hex[:8]}"

    user_provided_prompt = text_prompt.strip()
    prompt = f"<image>\n{user_provided_prompt}" if user_provided_prompt else "<image>\n<|grounding|>Convert the document to markdown."
    
    vllm_input = {"prompt": prompt, "multi_modal_data": {"image": ocr_processor.tokenize_with_images(images=[image], conversation=prompt, bos=True, eos=True, cropping=CROP_MODE)}}
    
    sampling_params = SamplingParams(
        temperature=body.temperature or 0.0, 
        max_tokens=body.max_tokens or 4096, 
        #logits_processors=[NoRepeatNGramLogitsProcessor(ngram_size=20, window_size=50)],
        repetition_penalty=1.1,
        skip_special_tokens=False
    )

    outputs = llm.generate([vllm_input], sampling_params)
    output = outputs[0]
    raw_text = output.outputs[0].text
    finish_reason = output.outputs[0].finish_reason

    # --- Save annotated image and process text ---
    matches_ref, matches_images, matches_other = re_match(raw_text)
    
    # This function saves the cropped images in an 'images' sub-directory and returns the main annotated image
    annotated_image = draw_bounding_boxes_and_save_crops(image, matches_ref, 1, CHAT_OUTPUT_DIR, False, base_filename)
    
    # Save the main layout image
    annotated_filename = f"{base_filename}_layout.jpg"
    annotated_image_path = os.path.join(CHAT_OUTPUT_DIR, annotated_filename)
    annotated_image.save(annotated_image_path)
    logging.info(f"✅ Saved chat annotated image to: {annotated_image_path}")

    # --- Prepare the final rich markdown response content ---
    
    # 1. Process the raw_text to include cropped images with absolute URLs
    processed_text = raw_text
    # Replace image references with absolute URLs
    for idx, match_image in enumerate(matches_images):
        img_name = f"{base_filename}_{idx}.jpg"
        img_url = f"{BACKEND_BASE_URL}/outputs/images/{img_name}"
        processed_text = processed_text.replace(match_image[0], f'![sub-image {idx}]({img_url})\n')

    # Remove other non-image reference blocks
    for match_other in matches_other:
        processed_text = processed_text.replace(match_other[0], '')

    # Final cleanup of special tokens and formatting
    processed_text = processed_text.replace('<｜end of sentence｜>', '').replace('\\coloneqq', ':=').replace('\\eqqcolon', '=:').replace('\n\n\n\n', '\n\n').replace('\n\n\n', '\n\n').strip()

    # 2. Create the URL for the main annotated image
    main_image_url = f"{BACKEND_BASE_URL}/outputs/{annotated_filename}"

    # 3. Combine processed text (with cropped images) and the main annotated image
    final_content = f"{processed_text}\n\n![Annotated Image]({main_image_url})"
    
    # --- End of New Logic ---

    prompt_tokens = len(output.prompt_token_ids)
    completion_tokens = len(output.outputs[0].token_ids)
    usage = UsageInfo(prompt_tokens=prompt_tokens, completion_tokens=completion_tokens, total_tokens=prompt_tokens + completion_tokens)

    if body.stream:
        async def stream_generator():
            chunk_id = f"chatcmpl-{uuid.uuid4()}"
            created_time = int(time.time())
            
            # First chunk: send role
            yield f"data: {ChatCompletionChunk(id=chunk_id, created=created_time, model=body.model, choices=[ChatCompletionChoiceDelta(index=0, delta=DeltaMessage(role='assistant'))]).model_dump_json(exclude_none=True)}\n\n"
            
            # Second chunk: send the entire rich content
            if final_content:
                yield f"data: {ChatCompletionChunk(id=chunk_id, created=created_time, model=body.model, choices=[ChatCompletionChoiceDelta(index=0, delta=DeltaMessage(content=final_content))]).model_dump_json(exclude_none=True)}\n\n"

            # Final chunk: signal completion and include usage stats
            final_chunk = ChatCompletionChunk(
                id=chunk_id,
                created=created_time,
                model=body.model,
                choices=[ChatCompletionChoiceDelta(index=0, delta=DeltaMessage(), finish_reason=finish_reason)],
                usage=usage
            )
            yield f"data: {final_chunk.model_dump_json(exclude_none=True)}\n\n"
            yield "data: [DONE]\n\n"

        return StreamingResponse(stream_generator(), media_type="text/event-stream")
    else:
        # Non-streaming response
        choice = Choice(index=0, message=ChatCompletionMessage(content=final_content), finish_reason=finish_reason)
        return ChatCompletionResp(model=body.model, choices=[choice], usage=usage)

# =================== Main Execution ===================

if __name__ == "__main__":
    import uvicorn
    print("\n🚀  Enhanced DeepSeek-OCR API is running. ✅")
    print("🔗 Endpoints available:")
    print("  - OpenAI compatible: POST /v1/chat/completions (for Open-WebUI)")
    print("  - Path-based OCR:    POST /ocr/process_path (for n8n, automation)")
    print("  - Upload-based OCR:  POST /ocr/process_upload (for interactive testing)")
    print(f"👉  Local:     http://127.0.0.1:8000/docs")

    uvicorn.run(app, host="0.0.0.0", port=8000)
```


### API 代码
```python 
import os
import io
import json
import re
import uuid
import time
import base64
import logging
import requests
import ast
from typing import List, Optional, Dict, Union, Literal, Tuple

import torch
import fitz  # PyMuPDF
import numpy as np
import img2pdf
from PIL import Image, ImageDraw, ImageFont
from fastapi import FastAPI, UploadFile, Form, HTTPException, BackgroundTasks, Body
from fastapi.staticfiles import StaticFiles
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field, Extra

# =================== Logging Setup ===================
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')


# =================== Environment and VLLM Setup ===================
# Set environment variables before importing VLLM
if torch.version.cuda == '11.8':
    os.environ["TRITON_PTXAS_PATH"] = "/usr/local/cuda-11.8/bin/ptxas"
os.environ['VLLM_USE_V1'] = '0'
os.environ["CUDA_VISIBLE_DEVICES"] = '0'

from vllm import LLM, SamplingParams
from vllm.model_executor.models.registry import ModelRegistry
from deepseek_ocr import DeepseekOCRForCausalLM
from process.image_process import DeepseekOCRProcessor
from process.ngram_norepeat import NoRepeatNGramLogitsProcessor
from config import MODEL_PATH, CROP_MODE, PROMPT as DEFAULT_PROMPT

# Define the output directory for chat-based completions
CHAT_OUTPUT_DIR = "/home/nonlinear/DeepSeek-OCR/OCR"
# The base URL where this backend is accessible. Used to construct absolute URLs for images.
BACKEND_BASE_URL = "http://localhost:8000"

# Register the custom model with VLLM
ModelRegistry.register_model("DeepseekOCRForCausalLM", DeepseekOCRForCausalLM)


# =================== Pydantic Models for API Configuration ===================

# --- Models for path-based and upload-based OCR ---
class VLLMSamplingParams(BaseModel):
    temperature: float = Field(0.0, ge=0.0, le=1.0)
    max_tokens: int = Field(8192, gt=0)

class PdfConfig(BaseModel):
    first_page: Optional[int] = Field(None)
    last_page: Optional[int] = Field(None)

class OCRConfig(BaseModel):
    prompt: str = Field(DEFAULT_PROMPT)
    sampling_params: VLLMSamplingParams = Field(default_factory=VLLMSamplingParams)
    pdf_config: Optional[PdfConfig] = Field(default_factory=PdfConfig)

class PathProcessingRequest(BaseModel):
    input_path: str = Field(..., description="Absolute path to the input file on the server.")
    output_path: str = Field(..., description="Absolute path to the output directory to save results.")
    webhook_url: Optional[str] = Field(None, description="Optional webhook URL to send a POST request to upon completion.")
    config: OCRConfig = Field(default_factory=OCRConfig)

# --- Models for OpenAI Compatibility (Open-WebUI) ---
class TextPart(BaseModel):
    type: Literal["text"]
    text: str

class ImageUrlPart(BaseModel):
    type: Literal["image_url"]
    image_url: Dict[str, str]

class Message(BaseModel):
    role: Literal["system", "user", "assistant"]
    content: Union[str, List[Union[TextPart, ImageUrlPart]]]

class ChatCompletionReq(BaseModel):
    model: str = "deepseek-ocr"
    messages: List[Message]
    temperature: Optional[float] = 0.3
    max_tokens: Optional[int] = 4096
    stream: bool = False
    class Config:
        extra = Extra.allow

# Models for non-streaming response
class UsageInfo(BaseModel):
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int

class ChatCompletionMessage(BaseModel):
    role: Literal["assistant"] = "assistant"
    content: str

class Choice(BaseModel):
    index: int
    message: ChatCompletionMessage
    finish_reason: Optional[str] = None
    logprobs: Optional[None] = None

class ChatCompletionResp(BaseModel):
    id: str = Field(default_factory=lambda: f"chatcmpl-{uuid.uuid4()}")
    object: str = "chat.completion"
    created: int = Field(default_factory=lambda: int(time.time()))
    model: str
    choices: List[Choice]
    usage: UsageInfo
    system_fingerprint: Optional[str] = "fp_deepseek_ocr_v1"

# Models for streaming response
class DeltaMessage(BaseModel):
    role: Optional[Literal["assistant"]] = None
    content: Optional[str] = None

class ChatCompletionChoiceDelta(BaseModel):
    index: int
    delta: DeltaMessage
    finish_reason: Optional[str] = None
    logprobs: Optional[None] = None

class ChatCompletionChunk(BaseModel):
    id: str
    object: str = "chat.completion.chunk"
    created: int
    model: str
    choices: List[ChatCompletionChoiceDelta]
    system_fingerprint: Optional[str] = "fp_deepseek_ocr_v1"
    usage: Optional[UsageInfo] = Field(None, description="Usage stats for the entire request, present in the final chunk.")


# =================== FastAPI App and Global Objects ===================

app = FastAPI(
    title="Enhanced DeepSeek-OCR API", 
    version="3.2.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Mount the OCR output directory to be served statically at the /outputs path
os.makedirs(CHAT_OUTPUT_DIR, exist_ok=True)
app.mount("/outputs", StaticFiles(directory=CHAT_OUTPUT_DIR), name="outputs")

logging.info("🚀 Initializing VLLM Engine... (This may take a moment)")
llm = LLM(
    model=MODEL_PATH,
    hf_overrides={"architectures": ["DeepseekOCRForCausalLM"]},
    block_size=128,
    enforce_eager=False,
    trust_remote_code=True,
    max_model_len=4096,
    max_num_seqs=2,
    gpu_memory_utilization=0.95,
    disable_mm_preprocessor_cache=True,
    dtype="float16"
)

# llm = LLM(
#     model=MODEL_PATH,
#     hf_overrides={"architectures": ["DeepseekOCRForCausalLM"]},
#     block_size=256,
#     enforce_eager=False,
#     trust_remote_code=True,
#     max_model_len=4096,
#     max_num_seqs=16,
#     gpu_memory_utilization=0.95,
#     disable_mm_preprocessor_cache=True,
#     dtype="float16"
# )
logging.info("✅ VLLM Engine Initialized.")

#ocr_processor = DeepseekOCRProcessor()

# Explicitly load the tokenizer, disabling the "fast" version to ensure
# correct handling of Chinese characters, which can be buggy in some fast tokenizers.
logging.info("Loading tokenizer with use_fast=False...")
from transformers import AutoTokenizer
tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH, use_fast=False)
# Pass the explicitly loaded tokenizer to the processor.
ocr_processor = DeepseekOCRProcessor(tokenizer=tokenizer)



logging.info("✅ DeepSeek-OCR Processor Initialized.")


# =================== Helper Functions ===================

def cleanup_model_output(text: str) -> str:
    """Removes raw model tags from the output for a cleaner response."""
    # This pattern finds all occurrences of the ref/det tags.
    pattern = r'(<\|ref\|>.*?<\|/ref\|><\|det\|>.*?<\|/det\|>)'
    cleaned_text = re.sub(pattern, '', text, flags=re.DOTALL)
    # Also remove the end of sentence token
    cleaned_text = cleaned_text.replace('<｜end of sentence｜>', '').strip()
    return cleaned_text

def get_images_from_path(input_path: str, pdf_config: PdfConfig) -> Tuple[List[Image.Image], int]:
    """
    Gets a list of PIL images from a local file path (image or PDF).
    Returns a tuple of (list_of_images, actual_start_page).
    For single images, actual_start_page is 1.
    """
    if not os.path.exists(input_path):
        raise FileNotFoundError(f"Input file not found at: {input_path}")

    _, extension = os.path.splitext(input_path)
    extension = extension.lower()

    if extension == ".pdf":
        logging.info(f"Reading PDF from path: {input_path}")
        with open(input_path, "rb") as f:
            pdf_bytes = f.read()
        # pdf_to_images now returns a tuple
        return pdf_to_images(pdf_bytes, pdf_config.first_page, pdf_config.last_page)
    elif extension in [".png", ".jpg", ".jpeg", ".bmp", ".webp"]:
        logging.info(f"Reading image from path: {input_path}")
        return [Image.open(input_path).convert("RGB")], 1
    else:
        raise ValueError(f"Unsupported file extension: {extension}")

def pdf_to_images(pdf_bytes: bytes, first_page: Optional[int], last_page: Optional[int], dpi: int = 300) -> Tuple[List[Image.Image], int]:
    """
    Converts a PDF file in bytes to a list of PIL images with detailed logging and custom page range logic.
    Returns a tuple of (list_of_images, actual_start_page).
    """
    images = []
    try:
        logging.info("Opening PDF document from bytes...")
        pdf_document = fitz.open(stream=pdf_bytes, filetype="pdf")
    except Exception as e:
        logging.error(f"Failed to open PDF with PyMuPDF: {e}")
        raise

    total_pages = pdf_document.page_count
    logging.info(f"PDF has {total_pages} pages. Requested range: {first_page}-{last_page}")

    # Determine the page range based on user's flexible logic
    user_start = first_page if first_page is not None else 1
    user_end = last_page if last_page is not None else total_pages

    actual_start = user_start
    actual_end = user_end

    # Apply user's custom fallback logic
    if user_start > total_pages or user_start > user_end:
        logging.warning(f"Invalid page range detected (start={user_start}, end={user_end}, total={total_pages}). Defaulting to read all pages.")
        actual_start = 1
        actual_end = total_pages

    # Convert to 0-based index for fitz library
    start_index = actual_start - 1
    end_index = min(actual_end, total_pages)

    if start_index >= end_index:
        logging.warning(f"Calculated invalid page range: start index {start_index} is not before end index {end_index}. No pages will be processed.")
        pdf_document.close()
        return [], 1 # Return empty list and default start page 1

    logging.info(f"Processing pages from {actual_start} to {end_index}.")

    zoom = dpi / 72.0
    matrix = fitz.Matrix(zoom, zoom)

    for page_num in range(start_index, end_index):
        logging.info(f"Rendering page {page_num + 1}...")
        try:
            page = pdf_document[page_num]
            pixmap = page.get_pixmap(matrix=matrix, alpha=False)
            img_data = pixmap.tobytes("png")
            images.append(Image.open(io.BytesIO(img_data)).convert("RGB"))
            logging.info(f"Successfully rendered page {page_num + 1}.")
        except Exception as e:
            logging.error(f"Failed to render page {page_num + 1}: {e}")
            # Continue to next page if one page fails
            continue
    
    pdf_document.close()
    logging.info(f"Finished PDF processing. Extracted {len(images)} images.")
    return images, actual_start


def re_match(text):
    """Extracts structured data references from OCR text."""
    pattern = r'(<\|ref\|>(.*?)<\|/ref\|><\|det\|>(.*?)<\|/det\|>)'
    matches = re.findall(pattern, text, re.DOTALL)

    mathes_image = []
    mathes_other = []
    for a_match in matches:
        if '<|ref|>image<|/ref|>' in a_match[0]:
            mathes_image.append(a_match)
        else:
            mathes_other.append(a_match)
    return matches, mathes_image, mathes_other


def extract_coordinates_and_label(ref_text, image_width, image_height):
    """Extracts label and coordinates from a reference."""
    try:
        label_type = ref_text[1]
        # Using ast.literal_eval for safe evaluation
        cor_list = ast.literal_eval(ref_text[2])
        # Basic validation: ensure it's a list (or list of lists)
        if not isinstance(cor_list, list):
            return None
        return (label_type, cor_list)
    except (ValueError, SyntaxError, TypeError) as e:
        # Silently handle expected parsing errors from literal_eval
        # This prevents log flooding for malformed or empty coordinate strings
        return None
    except Exception as e:
        # Log other unexpected errors
        logging.error(f"Unexpected error extracting coordinates: {e}")
        return None


def draw_bounding_boxes_and_save_crops(image, refs, page_num, output_dir, is_pdf, base_filename):
    """Draws bounding boxes on an image and saves cropped sub-images."""
    image_width, image_height = image.size
    img_draw = image.copy()
    draw = ImageDraw.Draw(img_draw)

    overlay = Image.new('RGBA', img_draw.size, (0, 0, 0, 0))
    draw2 = ImageDraw.Draw(overlay)
    
    try:
        font = ImageFont.load_default()
    except IOError:
        font = ImageFont.load_default()

    images_dir = os.path.join(output_dir, "images")
    os.makedirs(images_dir, exist_ok=True)
    
    img_idx = 0
    
    for i, ref in enumerate(refs):
        try:
            result = extract_coordinates_and_label(ref, image_width, image_height)
            if result:
                label_type, points_list = result
                
                color = (np.random.randint(0, 200), np.random.randint(0, 200), np.random.randint(0, 255))
                color_a = color + (20, )

                for points in points_list:
                    x1, y1, x2, y2 = points
                    x1 = int(x1 / 999 * image_width)
                    y1 = int(y1 / 999 * image_height)
                    x2 = int(x2 / 999 * image_width)
                    y2 = int(y2 / 999 * image_height)

                    if label_type == 'image':
                        try:
                            cropped = image.crop((x1, y1, x2, y2))
                            img_name = f"{base_filename}_{page_num}_{img_idx}.jpg" if is_pdf else f"{base_filename}_{img_idx}.jpg"
                            cropped.save(os.path.join(images_dir, img_name))
                        except Exception as e:
                            logging.error(f"Error saving cropped image: {e}")
                        img_idx += 1
                        
                    try:
                        width = 4 if label_type == 'title' else 2
                        draw.rectangle([x1, y1, x2, y2], outline=color, width=width)
                        draw2.rectangle([x1, y1, x2, y2], fill=color_a, outline=(0, 0, 0, 0), width=1)

                        text_x = x1
                        text_y = max(0, y1 - 15)
                            
                        text_bbox = draw.textbbox((text_x, text_y), label_type, font=font)
                        text_width = text_bbox[2] - text_bbox[0]
                        text_height = text_bbox[3] - text_bbox[1]
                        draw.rectangle([text_x, text_y, text_x + text_width, text_y + text_height], fill=(255, 255, 255, 30))
                        draw.text((text_x, text_y), label_type, font=font, fill=color)
                    except Exception as e:
                        logging.error(f"Error drawing bounding box: {e}")
        except Exception as e:
            logging.error(f"Error processing ref: {e}")
            continue
            
    img_draw.paste(overlay, (0, 0), overlay)
    return img_draw


def pil_to_pdf_img2pdf(pil_images, output_path):
    """Converts a list of PIL images to a single PDF file."""
    if not pil_images:
        return
    
    image_bytes_list = []
    for img in pil_images:
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        img_buffer = io.BytesIO()
        img.save(img_buffer, format='JPEG', quality=95)
        image_bytes_list.append(img_buffer.getvalue())
    
    try:
        pdf_bytes = img2pdf.convert(image_bytes_list)
        with open(output_path, "wb") as f:
            f.write(pdf_bytes)
    except Exception as e:
        logging.error(f"Error converting images to PDF: {e}")


def _extract_image_from_uri(uri: str) -> Optional[Image.Image]:
    """Extracts a PIL image from a data URI."""
    if not uri:
        return None
    
    # Regex to find base64 content in a data URI.
    # It looks for `base64,` and captures everything after it.
    # This is more robust than matching the full `data:image/...` prefix.
    match = re.search(r"base64,(.*)", uri)
    if not match:
        return None
        
    base64_str = match.group(1)
    try:
        image_bytes = base64.b64decode(base64_str)
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        return image
    except Exception as e:
        logging.warning(f"Found base64 data but failed to decode/open image: {e}")
        return None


def do_path_processing(req: PathProcessingRequest):
    """The actual long-running task for path-based processing with webhook callback."""
    logging.info(f"Starting background job for input: {req.input_path}")
    status = "success"
    error_message = None
    output_files = {}

    try:
        pdf_config = req.config.pdf_config or PdfConfig()
        images_to_process, actual_start_page = get_images_from_path(req.input_path, pdf_config)
        
        if not images_to_process:
            logging.warning(f"No images extracted from {req.input_path}. Aborting job.")
            status = "aborted"
            error_message = "No images could be extracted from the input file."
            return

        # Correctly format the prompt to ensure exactly one <image> placeholder
        user_prompt = req.config.prompt
        if "<image>" not in user_prompt:
            prompt_with_placeholder = f"<image>\n{user_prompt}"
        else:
            prompt_with_placeholder = user_prompt

        batch_inputs = [
            {
                "prompt": prompt_with_placeholder,
                "multi_modal_data": {"image": ocr_processor.tokenize_with_images(images=[img], conversation=prompt_with_placeholder, bos=True, eos=True, cropping=CROP_MODE)},
            }
            for img in images_to_process
        ]

        sampling_params = SamplingParams(
            temperature=req.config.sampling_params.temperature,
            max_tokens=req.config.sampling_params.max_tokens,
            logits_processors=[NoRepeatNGramLogitsProcessor(ngram_size=20, window_size=50)],
            skip_special_tokens=False,
        )

        outputs = llm.generate(batch_inputs, sampling_params)

        os.makedirs(req.output_path, exist_ok=True)
        is_pdf = req.input_path.lower().endswith('.pdf')
        base_filename = os.path.splitext(os.path.basename(req.input_path))[0]
        
        page_suffix = f"_{actual_start_page}-{actual_start_page + len(images_to_process) - 1}" if is_pdf and len(images_to_process) > 0 else ""

        contents_det = ""
        contents = ""
        draw_images = []

        for i, (output, original_image) in enumerate(zip(outputs, images_to_process)):
            raw_text = output.outputs[0].text
            real_page_num = actual_start_page + i
            page_separator = f'\n\n<--- Page {real_page_num} --->\n\n'
            contents_det += raw_text + page_separator

            matches_ref, matches_images, matches_other = re_match(raw_text)
            
            annotated_image = draw_bounding_boxes_and_save_crops(
                original_image, matches_ref, real_page_num, req.output_path, is_pdf, base_filename
            )
            draw_images.append(annotated_image)

            processed_text = raw_text
            for idx, match_image in enumerate(matches_images):
                img_name = f"{base_filename}_{real_page_num}_{idx}.jpg" if is_pdf else f"{base_filename}_{idx}.jpg"
                processed_text = processed_text.replace(match_image[0], f'![](images/{img_name})\n')
            
            for match_other in matches_other:
                processed_text = processed_text.replace(match_other[0], '')
            
            processed_text = processed_text.replace('<｜end of sentence｜>', '').replace('\\coloneqq', ':=').replace('\\eqqcolon', '=:').replace('\n\n\n\n', '\n\n').replace('\n\n\n', '\n\n')
            contents += processed_text + page_separator

        det_output_filename = os.path.join(req.output_path, f"{base_filename}{page_suffix}_det.md")
        with open(det_output_filename, "w", encoding="utf-8") as f:
            f.write(contents_det.strip())
        output_files["detailed_markdown"] = det_output_filename

        md_output_filename = os.path.join(req.output_path, f"{base_filename}{page_suffix}.md")
        with open(md_output_filename, "w", encoding="utf-8") as f:
            f.write(contents.strip())
        output_files["processed_markdown"] = md_output_filename

        if is_pdf:
            pdf_out_path = os.path.join(req.output_path, f"{base_filename}{page_suffix}_layouts.pdf")
            pil_to_pdf_img2pdf(draw_images, pdf_out_path)
            logging.info(f"✅ Saved annotated PDF to: {pdf_out_path}")
            output_files["annotated_pdf"] = pdf_out_path
        elif draw_images:
            img_out_path = os.path.join(req.output_path, f"{base_filename}_layout.jpg")
            draw_images[0].save(img_out_path)
            logging.info(f"✅ Saved annotated image to: {img_out_path}")
            output_files["annotated_image"] = img_out_path

        logging.info(f"✅ Background job finished. Outputs saved in: {req.output_path}")

    except Exception as e:
        status = "error"
        error_message = str(e)
        logging.error(f"❌ Error in background job for {req.input_path}: {e}", exc_info=True)

    finally:
        if req.webhook_url:
            logging.info(f"Sending webhook callback to: {req.webhook_url}")
            try:
                payload = {
                    "status": status,
                    "input_path": req.input_path,
                    "output_path": req.output_path,
                    "output_files": output_files,
                    "error": error_message,
                    "timestamp": time.time()
                }
                requests.post(req.webhook_url, json=payload, timeout=10)
                logging.info(f"[webhook] about to POST to -> {req.webhook_url}")
                logging.info("✅ Webhook callback sent successfully.")
                
            except Exception as e:
                logging.error(f"❌ Failed to send webhook callback to {req.webhook_url}: {e}", exc_info=True)
        
        # Force clear CUDA cache to prevent memory fragmentation
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
            logging.info("CUDA cache cleared after path processing job.")


# =================== API Endpoints ===================

# --- Endpoint for n8n and file-based automation ---
@app.post("/ocr/process_path")
async def ocr_process_path(request: PathProcessingRequest, background_tasks: BackgroundTasks):
    background_tasks.add_task(do_path_processing, request)
    return {"status": "processing_started", "input_path": request.input_path, "output_path": request.output_path}

# --- Endpoint for interactive file uploads ---
@app.post("/ocr/process_upload")
async def ocr_process_upload(file: UploadFile, config_json: str = Form('{}')):
    try:
        try:
            config = OCRConfig.parse_obj(json.loads(config_json))
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid config_json: {e}")

        file_content = await file.read()
        images_to_process = []
        actual_start_page = 1 # Default for single images or if PDF processing fails before returning a start page

        if file.content_type == "application/pdf":
            try:
                # pdf_to_images now returns a tuple (images, actual_start_page)
                images_to_process, actual_start_page = pdf_to_images(file_content, config.pdf_config.first_page, config.pdf_config.last_page)
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Failed to process PDF: {e}")
        elif file.content_type and file.content_type.startswith("image/"):
            images_to_process.append(Image.open(io.BytesIO(file_content)).convert("RGB"))
        else:
            raise HTTPException(status_code=415, detail=f"Unsupported file type: {file.content_type}")

        if not images_to_process:
            raise HTTPException(status_code=400, detail="No images could be extracted from the uploaded file.")

        # Correctly format the prompt to ensure exactly one <image> placeholder
        user_prompt = config.prompt
        if "<image>" not in user_prompt:
            prompt_with_placeholder = f"<image>\n{user_prompt}"
        else:
            prompt_with_placeholder = user_prompt

        batch_inputs = [{"prompt": prompt_with_placeholder, "multi_modal_data": {"image": ocr_processor.tokenize_with_images(images=[img], conversation=prompt_with_placeholder, bos=True, eos=True, cropping=CROP_MODE)}} for img in images_to_process]
        
        sampling_params = SamplingParams(temperature=config.sampling_params.temperature, max_tokens=config.sampling_params.max_tokens, logits_processors=[NoRepeatNGramLogitsProcessor(ngram_size=20, window_size=50)], skip_special_tokens=False)
        outputs = llm.generate(batch_inputs, sampling_params)

        results = []
        # Use the actual_start_page for correct labeling
        for i, output in enumerate(outputs):
            raw_text = output.outputs[0].text
            cleaned_text = cleanup_model_output(raw_text)
            results.append({
                "page_number": actual_start_page + i,
                "text": cleaned_text
            })
        return {"results": results}
    finally:
        # Force clear CUDA cache to prevent memory fragmentation
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
            logging.info("CUDA cache cleared after upload processing.")

# --- Endpoints for Open-WebUI Compatibility ---
@app.get("/v1/models")
async def list_models():
    return {"object": "list", "data": [{"id": "deepseek-ocr", "object": "model", "created": int(time.time()), "owned_by": "deepseek"}]}

@app.post("/v1/chat/completions")
async def chat_completions(body: ChatCompletionReq):
    image = None
    text_prompt = ""

    if not body.messages:
        raise HTTPException(status_code=400, detail="No messages provided")

    last_msg = body.messages[-1]

    if isinstance(last_msg.content, str):
        text_prompt = last_msg.content
        image = _extract_image_from_uri(text_prompt)
    elif isinstance(last_msg.content, list):
        for part in last_msg.content:
            if part.type == "text":
                text_prompt += part.text
            elif part.type == "image_url":
                if image is not None:
                    logging.warning("Multiple images detected, but only the first one will be used.")
                    continue
                
                image_url_data = part.image_url.get("url")
                image = _extract_image_from_uri(image_url_data)

    if image is None:
        # If no image is found, return a regular chat message asking the user to upload one.
        if body.stream:
            async def stream_error_generator():
                chunk_id = f"chatcmpl-{uuid.uuid4()}"
                created_time = int(time.time())
                error_message = "Please upload an image for OCR processing."
                
                # Chunk 1: Role
                yield f"data: {ChatCompletionChunk(id=chunk_id, created=created_time, model=body.model, choices=[ChatCompletionChoiceDelta(index=0, delta=DeltaMessage(role='assistant'))]).model_dump_json(exclude_none=True)}\n\n"
                
                # Chunk 2: Content
                yield f"data: {ChatCompletionChunk(id=chunk_id, created=created_time, model=body.model, choices=[ChatCompletionChoiceDelta(index=0, delta=DeltaMessage(content=error_message))]).model_dump_json(exclude_none=True)}\n\n"
                
                # Chunk 3: Finish reason
                yield f"data: {ChatCompletionChunk(id=chunk_id, created=created_time, model=body.model, choices=[ChatCompletionChoiceDelta(index=0, delta=DeltaMessage(), finish_reason='stop')]).model_dump_json(exclude_none=True)}\n\n"
                
                yield "data: [DONE]\n\n"
            return StreamingResponse(stream_error_generator(), media_type="text/event-stream")
        else:
            return ChatCompletionResp(model=body.model, choices=[Choice(index=0, message=ChatCompletionMessage(content="Please upload an image for OCR processing."), finish_reason="stop")], usage=UsageInfo(prompt_tokens=0, completion_tokens=0, total_tokens=0))

    # --- Logic to save files and prepare response URL ---
    os.makedirs(CHAT_OUTPUT_DIR, exist_ok=True)
    base_filename = f"chat_{uuid.uuid4().hex[:8]}"

    user_provided_prompt = text_prompt.strip()
    prompt = f"<image>\n{user_provided_prompt}" if user_provided_prompt else "<image>\n<|grounding|>Convert the document to markdown."
    
    vllm_input = {"prompt": prompt, "multi_modal_data": {"image": ocr_processor.tokenize_with_images(images=[image], conversation=prompt, bos=True, eos=True, cropping=CROP_MODE)}}
    
    sampling_params = SamplingParams(temperature=body.temperature or 0.0, max_tokens=body.max_tokens or 4096, logits_processors=[NoRepeatNGramLogitsProcessor(ngram_size=20, window_size=50)], skip_special_tokens=False)

    outputs = llm.generate([vllm_input], sampling_params)
    output = outputs[0]
    raw_text = output.outputs[0].text
    finish_reason = output.outputs[0].finish_reason

    # --- Save annotated image and process text ---
    matches_ref, matches_images, matches_other = re_match(raw_text)
    
    # This function saves the cropped images in an 'images' sub-directory and returns the main annotated image
    annotated_image = draw_bounding_boxes_and_save_crops(image, matches_ref, 1, CHAT_OUTPUT_DIR, False, base_filename)
    
    # Save the main layout image
    annotated_filename = f"{base_filename}_layout.jpg"
    annotated_image_path = os.path.join(CHAT_OUTPUT_DIR, annotated_filename)
    annotated_image.save(annotated_image_path)
    logging.info(f"✅ Saved chat annotated image to: {annotated_image_path}")

    # --- Prepare the final rich markdown response content ---
    
    # 1. Process the raw_text to include cropped images with absolute URLs
    processed_text = raw_text
    # Replace image references with absolute URLs
    for idx, match_image in enumerate(matches_images):
        img_name = f"{base_filename}_{idx}.jpg"
        img_url = f"{BACKEND_BASE_URL}/outputs/images/{img_name}"
        processed_text = processed_text.replace(match_image[0], f'![sub-image {idx}]({img_url})\n')

    # Remove other non-image reference blocks
    for match_other in matches_other:
        processed_text = processed_text.replace(match_other[0], '')

    # Final cleanup of special tokens and formatting
    processed_text = processed_text.replace('<｜end of sentence｜>', '').replace('\\coloneqq', ':=').replace('\\eqqcolon', '=:').replace('\n\n\n\n', '\n\n').replace('\n\n\n', '\n\n').strip()

    # 2. Create the URL for the main annotated image
    main_image_url = f"{BACKEND_BASE_URL}/outputs/{annotated_filename}"

    # 3. Combine processed text (with cropped images) and the main annotated image
    final_content = f"{processed_text}\n\n![Annotated Image]({main_image_url})"
    
    # --- End of New Logic ---

    prompt_tokens = len(output.prompt_token_ids)
    completion_tokens = len(output.outputs[0].token_ids)
    usage = UsageInfo(prompt_tokens=prompt_tokens, completion_tokens=completion_tokens, total_tokens=prompt_tokens + completion_tokens)

    if body.stream:
        async def stream_generator():
            chunk_id = f"chatcmpl-{uuid.uuid4()}"
            created_time = int(time.time())
            
            # First chunk: send role
            yield f"data: {ChatCompletionChunk(id=chunk_id, created=created_time, model=body.model, choices=[ChatCompletionChoiceDelta(index=0, delta=DeltaMessage(role='assistant'))]).model_dump_json(exclude_none=True)}\n\n"
            
            # Second chunk: send the entire rich content
            if final_content:
                yield f"data: {ChatCompletionChunk(id=chunk_id, created=created_time, model=body.model, choices=[ChatCompletionChoiceDelta(index=0, delta=DeltaMessage(content=final_content))]).model_dump_json(exclude_none=True)}\n\n"

            # Final chunk: signal completion and include usage stats
            final_chunk = ChatCompletionChunk(
                id=chunk_id,
                created=created_time,
                model=body.model,
                choices=[ChatCompletionChoiceDelta(index=0, delta=DeltaMessage(), finish_reason=finish_reason)],
                usage=usage
            )
            yield f"data: {final_chunk.model_dump_json(exclude_none=True)}\n\n"
            yield "data: [DONE]\n\n"

        return StreamingResponse(stream_generator(), media_type="text/event-stream")
    else:
        # Non-streaming response
        choice = Choice(index=0, message=ChatCompletionMessage(content=final_content), finish_reason=finish_reason)
        return ChatCompletionResp(model=body.model, choices=[choice], usage=usage)

# =================== Main Execution ===================

if __name__ == "__main__":
    import uvicorn
    print("\n🚀  Enhanced DeepSeek-OCR API is running. ✅")
    print("🔗 Endpoints available:")
    print("  - OpenAI compatible: POST /v1/chat/completions (for Open-WebUI)")
    print("  - Path-based OCR:    POST /ocr/process_path (for n8n, automation)")
    print("  - Upload-based OCR:  POST /ocr/process_upload (for interactive testing)")
    print(f"👉  Local:     http://127.0.0.1:8000/docs")

    uvicorn.run(app, host="0.0.0.0", port=8000)
```