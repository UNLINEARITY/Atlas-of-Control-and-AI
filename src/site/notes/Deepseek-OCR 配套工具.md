---
{"dg-path":"模型部署/Deepseek-OCR-配套工具.md","tags":["Code"],"dg-publish":true,"permalink":"/模型部署/Deepseek-OCR-配套工具/","dgPassFrontmatter":true,"noteIcon":"","created":"2025-11-14T16:54:39.720+08:00","updated":"2025-11-18T17:26:58.540+08:00"}
---


### 集成 Deepseek-OCR 配套 API 

[[Deepseek-OCR API示例#API 代码 (稍微完善)\|Deepseek-OCR API示例#API 代码 (稍微完善)]]

```python 
import re
import unicodedata
import tkinter as tk
from tkinter import messagebox, Frame, Label, Button, Text, filedialog, Entry
from tkinter import ttk  # Import for Notebook
import tkinter.font as tkFont
from PIL import Image, ImageTk, ImageGrab
import requests
import base64
import io
import threading
import json
import os

# ---------- CORE PROCESSING FUNCTIONS ----------
def normalize_math_chars(text):
    """Converts Unicode math variables to plain characters wrapped in $...$"""
    def convert_char(match):
        original_text = match.group(0)
        normalized_text = unicodedata.normalize('NFKD', original_text)
        normalized_text = normalized_text.replace("−", "-")
        return f"${normalized_text}$"

    math_unicode_pattern = r'[\U0001D434-\U0001D467\U0001D6A8-\U0001D6E1\U0001D7EC-\U0001D7F6]+(?:[^\\]+)?'
    text = re.sub(math_unicode_pattern, convert_char, text)
    return text

def convert_latex(text):
    """Basic LaTeX conversion"""
    text = re.sub(r'\\\[([\s\S]*?)\\\]', r'$\1$', text)
    text = re.sub(r'\\\(([\s\S]*?)\\\)', r'$\1



### 简单逻辑 (只有 latex 转换)

```python 
import re
import unicodedata
import tkinter as tk
from tkinter import messagebox
import tkinter.font as tkFont

# ---------- 核心处理函数 ----------
def normalize_math_chars(text):
    """转换 Unicode 数学变量为普通字符，并用 $...$ 包裹"""
    def convert_char(match):
        original_text = match.group(0)
        normalized_text = unicodedata.normalize('NFKD', original_text)
        normalized_text = normalized_text.replace("−", "-")
        return f"${normalized_text}$"

    math_unicode_pattern = r'[\U0001D434-\U0001D467\U0001D6A8-\U0001D6E1\U0001D7EC-\U0001D7F6]+(?:\[[^\|^]]+\])?'
    text = re.sub(math_unicode_pattern, convert_char, text)
    return text

def convert_latex(text):
    """最简 LaTeX 转换"""
    text = re.sub(r'\\\[([\s\S]*?)\\\]', r'$\1$', text)
    text = re.sub(r'\\\(([\s\S]*?)\\\)', r'$\1, text)
    text = normalize_math_chars(text)
    return text

# ---------- UI HELPER FUNCTIONS ----------
def copy_to_clipboard():
    result_text = output_text.get("1.0", tk.END).strip()
    if result_text:
        root.clipboard_clear()
        root.clipboard_append(result_text)
        messagebox.showinfo("Success", "Result copied to clipboard!")
    else:
        messagebox.showwarning("Warning", "No text to copy.")

def convert_action():
    input_text_value = input_text.get("1.0", tk.END).strip()
    if input_text_value:
        converted = convert_latex(input_text_value)
        output_text.delete("1.0", tk.END)
        output_text.insert(tk.END, converted)
        output_text.see("1.0")
    else:
        messagebox.showwarning("Warning", "Please input some text to convert.")

def clear_input():
    input_text.delete("1.0", tk.END)

def select_all(event):
    event.widget.tag_add("sel", "1.0", "end")
    return 'break'

# ---------- IMAGE OCR ----------
pasted_image = None
photo = None

def paste_image():
    """Pastes an image from the clipboard and displays it."""
    global pasted_image, photo
    try:
        img = ImageGrab.grabclipboard()
        if isinstance(img, Image.Image):
            pasted_image = img
            display_img = pasted_image.copy()
            display_img.thumbnail((image_label.winfo_width() - 10, image_label.winfo_height() - 10))
            photo = ImageTk.PhotoImage(display_img)
            image_label.config(image=photo, text="")
            image_label.image = photo
        elif img:
            messagebox.showinfo("Info", "Clipboard does not contain an image.")
        else:
            messagebox.showwarning("Warning", "No image found on clipboard.")
    except Exception as e:
        messagebox.showerror("Error", f"Failed to paste image: {e}")

def run_image_ocr():
    """Prepares and runs the OCR for the pasted image."""
    if pasted_image is None:
        messagebox.showwarning("Warning", "Please paste an image first.")
        return

    prompt = prompt_text.get("1.0", tk.END).strip()
    if not prompt:
        prompt = "<|grounding|>Convert the document to markdown."

    ocr_button.config(state=tk.DISABLED, text="Processing...")
    thread = threading.Thread(target=api_call_image_ocr, args=(pasted_image, prompt))
    thread.start()

def api_call_image_ocr(image, prompt):
    """Sends the image to the DeepSeek OCR API."""
    try:
        buffered = io.BytesIO()
        image.convert("RGB").save(buffered, format="JPEG")
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
        data_uri = f"data:image/jpeg;base64,{img_str}"

        payload = {
            "model": "deepseek-ocr",
            "messages": [{"role": "user", "content": [{"type": "text", "text": prompt}, {"type": "image_url", "image_url": {"url": data_uri}}]}],
            "stream": False
        }

        response = requests.post("http://localhost:8000/v1/chat/completions", json=payload, timeout=120)
        response.raise_for_status()
        result = response.json()
        ocr_text = result['choices'][0]['message']['content']
        root.after(0, update_ui_with_ocr_result, ocr_text)
    except requests.exceptions.RequestException as e:
        root.after(0, lambda: messagebox.showerror("Error", f"API request failed: {e}\n\nIs the flexible_app.py server running?"))
    except Exception as e:
        root.after(0, lambda: messagebox.showerror("Error", f"An error occurred during OCR: {e}"))
    finally:
        root.after(0, lambda: ocr_button.config(state=tk.NORMAL, text="DeepSeek OCR!"))

def update_ui_with_ocr_result(text):
    """Updates the input box with OCR result and triggers conversion."""
    input_text.delete("1.0", tk.END)
    input_text.insert(tk.END, text)
    convert_action()

# ---------- PDF DOCUMENT PROCESSING ----------
def rename_files_in_path(path):
    """
    Renames files with whitespace in their names at the given path.
    If path is a directory, scans all files within it.
    If path is a file, checks and renames only that file.
    Returns the potentially new path of the file, or the original directory path.
    """
    if not os.path.exists(path):
        messagebox.showwarning("Warning", f"Input path does not exist: {path}")
        return path

    try:
        if os.path.isdir(path):
            # It's a directory, scan and rename files inside
            for filename in os.listdir(path):
                if re.search(r'\s', filename):
                    old_file_path = os.path.join(path, filename)
                    new_filename = re.sub(r'\s+', '-', filename)
                    new_file_path = os.path.join(path, new_filename)

                    if os.path.exists(new_file_path):
                        print(f"Skipping rename: target '{new_file_path}' already exists.")
                        continue
                    
                    os.rename(old_file_path, new_file_path)
            return path  # Return original directory path

        elif os.path.isfile(path):
            # It's a single file
            directory, filename = os.path.split(path)
            if re.search(r'\s', filename):
                new_filename = re.sub(r'\s+', '-', filename)
                new_path = os.path.join(directory, new_filename)

                if os.path.exists(new_path):
                    print(f"Skipping rename: target '{new_path}' already exists.")
                    return path  # Return original path if target exists
                
                os.rename(path, new_path)
                return new_path  # Return the NEW path
    except Exception as e:
        messagebox.showerror("Error", f"An error occurred during file renaming: {e}")
        return path
    
    return path # Return original path if no changes were needed

def browse_input_file():
    file_path = filedialog.askopenfilename(
        title="Select a PDF or Image File",
        filetypes=[
            ("Processable Files", "*.pdf *.png *.jpg *.jpeg *.bmp *.webp"),
            ("PDF Files", "*.pdf"),
            ("Image Files", "*.png *.jpg *.jpeg *.bmp *.webp")
        ]
    )
    if file_path:
        pdf_input_path_entry.delete(0, tk.END)
        pdf_input_path_entry.insert(0, file_path)

def browse_input_folder():
    folder_path = filedialog.askdirectory(title="Select a Folder with PDFs")
    if folder_path:
        pdf_input_path_entry.delete(0, tk.END)
        pdf_input_path_entry.insert(0, folder_path)

def browse_output_folder():
    folder_path = filedialog.askdirectory(title="Select an Output Folder")
    if folder_path:
        pdf_output_path_entry.delete(0, tk.END)
        pdf_output_path_entry.insert(0, folder_path)

def run_pdf_processing():
    """Prepares and runs the PDF processing via API after sanitizing filenames."""
    input_path_raw = pdf_input_path_entry.get().strip()
    output_path = pdf_output_path_entry.get().strip()

    if not input_path_raw or not output_path:
        messagebox.showwarning("Warning", "Please provide both input path and output folder path.")
        return

    # --- Automatically rename files before processing ---
    input_path = rename_files_in_path(input_path_raw)
    # Update the UI entry with the potentially new path
    pdf_input_path_entry.delete(0, tk.END)
    pdf_input_path_entry.insert(0, input_path)
    # --- End of auto-rename logic ---

    start_page_str = pdf_start_page_entry.get().strip()
    end_page_str = pdf_end_page_entry.get().strip()
    prefix_str = pdf_prefix_entry.get().strip()

    try:
        prefix = int(prefix_str) if prefix_str else 0
        first_page = int(start_page_str) + prefix if start_page_str else None
        last_page = int(end_page_str) + prefix if end_page_str else None
    except ValueError:
        messagebox.showwarning("Warning", "Page numbers and prefix must be integers.")
        return

    ocr_button.config(state=tk.DISABLED, text="Processing...")
    thread = threading.Thread(target=api_call_pdf_processing, args=(input_path, output_path, first_page, last_page))
    thread.start()

def api_call_pdf_processing(input_path, output_path, first_page, last_page):
    """Calls the /ocr/process_path endpoint."""
    try:
        payload = {
            "input_path": input_path,
            "output_path": output_path,
            "config": {
                "pdf_config": {
                    "first_page": first_page,
                    "last_page": last_page
                }
            }
        }
        response = requests.post("http://localhost:8000/ocr/process_path", json=payload, timeout=20)
        response.raise_for_status()
        
        res_json = response.json()
        root.after(0, lambda: messagebox.showinfo("Success", f"Processing started successfully on the server.\nInput: {res_json.get('input_path')}\nOutput: {res_json.get('output_path')}"))

    except requests.exceptions.RequestException as e:
        root.after(0, lambda: messagebox.showerror("Error", f"API request failed: {e}\n\nIs the flexible_app.py server running?"))
    except Exception as e:
        root.after(0, lambda: messagebox.showerror("Error", f"An error occurred during PDF processing: {e}"))
    finally:
        root.after(0, lambda: ocr_button.config(state=tk.NORMAL, text="DeepSeek OCR!"))

# ---------- OCR DISPATCHER ----------
def dispatch_ocr_action():
    """Checks the active tab and calls the appropriate OCR function."""
    selected_tab = notebook.tab(notebook.select(), "text")
    if selected_tab == "Image":
        run_image_ocr()
    elif selected_tab == "PDF":
        run_pdf_processing()

# ---------- UI SETUP ----------
root = tk.Tk()
root.title("OCR and LaTeX Converter v2.0")
root.geometry("900x800")

default_font = tkFont.Font(family="Consolas", size=12)
root.option_add("*Font", default_font)

main_frame = Frame(root)
main_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

# ==========================================
#               LEFT PANEL
# ==========================================
left_frame = Frame(main_frame, width=450)
left_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=(0, 10))
left_frame.pack_propagate(False)

# --- Notebook for Tabs ---
notebook = ttk.Notebook(left_frame)
notebook.pack(fill=tk.BOTH, expand=True)

# --- IMAGE TAB ---
image_tab_frame = Frame(notebook)
notebook.add(image_tab_frame, text="Image")

image_label = Label(image_tab_frame, text="Click here\n\nCtrl+V to \n\npaste image", relief=tk.RIDGE, bd=2,justify="center",anchor="center")
image_label.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
image_label.bind("<Control-v>", lambda e: paste_image())
image_label.bind("<Control-V>", lambda e: paste_image())
image_label.bind("<Button-1>", lambda e: e.widget.focus_set())

# --- PDF TAB ---
pdf_tab_frame = Frame(notebook)
notebook.add(pdf_tab_frame, text="PDF")

# Use a main frame with padding that will contain the grid
pdf_controls_frame = Frame(pdf_tab_frame)
pdf_controls_frame.pack(fill=tk.BOTH, expand=True, padx=15, pady=20)

# Configure grid columns. A single column that will expand.
pdf_controls_frame.columnconfigure(0, weight=1)

# --- Input Path ---
Label(pdf_controls_frame, text="Input Path:").grid(row=0, column=0, sticky="w", pady=(5, 0))

input_frame = Frame(pdf_controls_frame)
input_frame.grid(row=1, column=0, sticky="ew", pady=(0, 10))
input_frame.columnconfigure(0, weight=1) # Entry inside this frame should expand

pdf_input_path_entry = Entry(input_frame)
pdf_input_path_entry.grid(row=0, column=0, sticky="ew")

# Frame for buttons to keep them together
input_btn_frame = Frame(input_frame)
input_btn_frame.grid(row=0, column=1, sticky="e", padx=(5, 0))
Button(input_btn_frame, text="File", command=browse_input_file).pack(side=tk.LEFT)
Button(input_btn_frame, text="Folder", command=browse_input_folder).pack(side=tk.LEFT, padx=(2, 0))

# --- Output Path ---
Label(pdf_controls_frame, text="Output Folder:").grid(row=2, column=0, sticky="w", pady=(5, 0))

output_frame = Frame(pdf_controls_frame)
output_frame.grid(row=3, column=0, sticky="ew", pady=(0, 10))
output_frame.columnconfigure(0, weight=1) # Entry inside this frame should expand

pdf_output_path_entry = Entry(output_frame)
pdf_output_path_entry.grid(row=0, column=0, sticky="ew")
Button(output_frame, text="Browse...", command=browse_output_folder).grid(row=0, column=1, padx=(5, 0))

# --- Page Range ---
Label(pdf_controls_frame, text="Page Range (opt):").grid(row=4, column=0, sticky="w", pady=(5, 0))

page_frame = Frame(pdf_controls_frame)
page_frame.grid(row=5, column=0, sticky="w", pady=(0, 10))

# Prefix
Label(page_frame, text="Prefix:").grid(row=0, column=0, sticky="w", pady=(0, 2))
pdf_prefix_entry = Entry(page_frame, width=10)
pdf_prefix_entry.insert(0, "0") # Default value
pdf_prefix_entry.grid(row=0, column=1, sticky="w", padx=(5, 0), pady=(0, 2))

# Start
Label(page_frame, text="Start:").grid(row=1, column=0, sticky="w", pady=(0, 2))
pdf_start_page_entry = Entry(page_frame, width=10)
pdf_start_page_entry.grid(row=1, column=1, sticky="w", padx=(5, 0), pady=(0, 2))

# End
Label(page_frame, text="End:").grid(row=2, column=0, sticky="w", pady=(0, 2))
pdf_end_page_entry = Entry(page_frame, width=10)
pdf_end_page_entry.grid(row=2, column=1, sticky="w", padx=(5, 0), pady=(0, 2))


# --- Unified OCR Button ---
ocr_button = Button(left_frame, text="DeepSeek OCR!", command=dispatch_ocr_action, height=2, bg="#D0E0FF")
ocr_button.pack(fill=tk.X, pady=3)

# ==========================================
#               RIGHT PANEL
# ==========================================
right_frame = Frame(main_frame, width=450)
right_frame.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True)
right_frame.pack_propagate(False)

# --- Prompt Area ---
Label(right_frame, text="Prompt (for Image OCR):").pack(anchor="w")
prompt_text = Text(right_frame, height=2)
prompt_text.pack(fill=tk.X)
prompt_text.insert("1.0", "<|grounding|>Convert the document to markdown.")
prompt_text.bind("<Control-a>", select_all)

# --- Input Area ---
Label(right_frame, text="Input / OCR Result:").pack(anchor="w", pady=(10, 0))
input_text = Text(right_frame, height=2)
input_text.pack(fill=tk.BOTH, expand=True)
input_text.bind("<Control-a>", select_all)

# --- Output Area ---
Label(right_frame, text="Converted LaTeX:").pack(anchor="w", pady=(10, 0))
output_text = Text(right_frame, height=2)
output_text.pack(fill=tk.BOTH, expand=True)
output_text.bind("<Control-a>", select_all)

# --- Bottom Buttons ---
bottom_button_frame = Frame(right_frame)
bottom_button_frame.pack(fill=tk.X, pady=5)
Button(bottom_button_frame, text="Clear Input", command=clear_input).pack(side=tk.LEFT)
Button(bottom_button_frame, text="Convert", command=convert_action).pack(side=tk.LEFT, padx=5)
Button(bottom_button_frame, text="Copy Result", command=copy_to_clipboard).pack(side=tk.RIGHT)

root.mainloop()
```



### 简单逻辑 (只有 latex 转换)

{{CODE_BLOCK_1}}, text)
    text = normalize_math_chars(text)
    return text

# ---------- Tkinter UI ----------
def copy_to_clipboard():
    result_text = output_text.get("1.0", tk.END).strip()
    if result_text:
        root.clipboard_clear()
        root.clipboard_append(result_text)
        messagebox.showinfo("Success", "Result copied to clipboard!")
    else:
        messagebox.showwarning("Warning", "No text to copy.")

def convert_action():
    input_text_value = input_text.get("1.0", tk.END).strip()
    if input_text_value:
        converted = convert_latex(input_text_value)
        output_text.delete("1.0", tk.END)
        output_text.insert(tk.END, converted)
        output_text.see("1.0")
    else:
        messagebox.showwarning("Warning", "Please input some text to convert.")

def clear_input():
    input_text.delete("1.0", tk.END)

def select_all(event):
    event.widget.tag_add("sel", "1.0", "end")
    return 'break'

# ---------- 创建窗口 ----------
root = tk.Tk()
root.title("LaTeX Converter")
root.geometry("900x780")

# ---------- 全局字体 ----------
default_font = tkFont.Font(family="Consolas", size=14)

# ==========================================
#               Prompt 区域
# ==========================================
prompt_label = tk.Label(root, text="Prompt:", font=default_font)
prompt_label.grid(row=0, column=0, sticky="w", padx=10, pady=(10, 0))

prompt_text = tk.Text(root, height=3, font=default_font)
prompt_text.grid(row=1, column=0, sticky="nsew", padx=10)
prompt_text.insert("1.0",
"""<|grounding|>Convert the document to markdown.
Describe this image in detail.
Locate <|ref|>eyes<|/ref|> in the image.""")
prompt_text.bind("<Control-a>", select_all)
prompt_text.bind("<Control-A>", select_all)

# ==========================================
#               LaTeX 输入区域
# ==========================================
input_label = tk.Label(root, text="Input LaTeX:", font=default_font)
input_label.grid(row=2, column=0, sticky="w", padx=10, pady=(10, 0))

input_text = tk.Text(root, height=5, font=default_font)
input_text.grid(row=3, column=0, sticky="nsew", padx=10)
input_text.bind("<Control-a>", select_all)
input_text.bind("<Control-A>", select_all)

clear_button = tk.Button(root, text="Clear Input", command=clear_input, font=default_font)
clear_button.grid(row=4, column=0, sticky="w", padx=10, pady=5)

# ==========================================
#               输出区域
# ==========================================
output_label = tk.Label(root, text="Converted LaTeX:", font=default_font)
output_label.grid(row=5, column=0, sticky="w", padx=10, pady=(10, 0))

output_text = tk.Text(root, height=5, font=default_font)
output_text.grid(row=6, column=0, sticky="nsew", padx=10)
output_text.bind("<Control-a>", select_all)
output_text.bind("<Control-A>", select_all)

# ==========================================
#               按钮区域
# ==========================================
convert_button = tk.Button(root, text="Convert", command=convert_action, font=default_font)
convert_button.grid(row=7, column=0, sticky="w", padx=10, pady=10)

copy_button = tk.Button(root, text="Copy to Clipboard", command=copy_to_clipboard, font=default_font)
copy_button.grid(row=7, column=0, sticky="e", padx=10, pady=10)


# ==========================================
#           布局自适应设置（关键）
# ==========================================
root.rowconfigure(1, weight=1)  # prompt
root.rowconfigure(3, weight=1)  # input 框
root.rowconfigure(6, weight=1)  # output 框

root.columnconfigure(0, weight=1)
root.columnconfigure(1, weight=0)
#root.columnconfigure(2, weight=0)

root.mainloop()
```, text)
    text = normalize_math_chars(text)
    return text

# ---------- UI HELPER FUNCTIONS ----------
def copy_to_clipboard():
    result_text = output_text.get("1.0", tk.END).strip()
    if result_text:
        root.clipboard_clear()
        root.clipboard_append(result_text)
        messagebox.showinfo("Success", "Result copied to clipboard!")
    else:
        messagebox.showwarning("Warning", "No text to copy.")

def convert_action():
    input_text_value = input_text.get("1.0", tk.END).strip()
    if input_text_value:
        converted = convert_latex(input_text_value)
        output_text.delete("1.0", tk.END)
        output_text.insert(tk.END, converted)
        output_text.see("1.0")
    else:
        messagebox.showwarning("Warning", "Please input some text to convert.")

def clear_input():
    input_text.delete("1.0", tk.END)

def select_all(event):
    event.widget.tag_add("sel", "1.0", "end")
    return 'break'

# ---------- IMAGE OCR ----------
pasted_image = None
photo = None

def paste_image():
    """Pastes an image from the clipboard and displays it."""
    global pasted_image, photo
    try:
        img = ImageGrab.grabclipboard()
        if isinstance(img, Image.Image):
            pasted_image = img
            display_img = pasted_image.copy()
            display_img.thumbnail((image_label.winfo_width() - 10, image_label.winfo_height() - 10))
            photo = ImageTk.PhotoImage(display_img)
            image_label.config(image=photo, text="")
            image_label.image = photo
        elif img:
            messagebox.showinfo("Info", "Clipboard does not contain an image.")
        else:
            messagebox.showwarning("Warning", "No image found on clipboard.")
    except Exception as e:
        messagebox.showerror("Error", f"Failed to paste image: {e}")

def run_image_ocr():
    """Prepares and runs the OCR for the pasted image."""
    if pasted_image is None:
        messagebox.showwarning("Warning", "Please paste an image first.")
        return

    prompt = prompt_text.get("1.0", tk.END).strip()
    if not prompt:
        prompt = "<|grounding|>Convert the document to markdown."

    ocr_button.config(state=tk.DISABLED, text="Processing...")
    thread = threading.Thread(target=api_call_image_ocr, args=(pasted_image, prompt))
    thread.start()

def api_call_image_ocr(image, prompt):
    """Sends the image to the DeepSeek OCR API."""
    try:
        buffered = io.BytesIO()
        image.convert("RGB").save(buffered, format="JPEG")
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
        data_uri = f"data:image/jpeg;base64,{img_str}"

        payload = {
            "model": "deepseek-ocr",
            "messages": [{"role": "user", "content": [{"type": "text", "text": prompt}, {"type": "image_url", "image_url": {"url": data_uri}}]}],
            "stream": False
        }

        response = requests.post("http://localhost:8000/v1/chat/completions", json=payload, timeout=120)
        response.raise_for_status()
        result = response.json()
        ocr_text = result['choices'][0]['message']['content']
        root.after(0, update_ui_with_ocr_result, ocr_text)
    except requests.exceptions.RequestException as e:
        root.after(0, lambda: messagebox.showerror("Error", f"API request failed: {e}\n\nIs the flexible_app.py server running?"))
    except Exception as e:
        root.after(0, lambda: messagebox.showerror("Error", f"An error occurred during OCR: {e}"))
    finally:
        root.after(0, lambda: ocr_button.config(state=tk.NORMAL, text="DeepSeek OCR!"))

def update_ui_with_ocr_result(text):
    """Updates the input box with OCR result and triggers conversion."""
    input_text.delete("1.0", tk.END)
    input_text.insert(tk.END, text)
    convert_action()

# ---------- PDF DOCUMENT PROCESSING ----------
def rename_files_in_path(path):
    """
    Renames files with whitespace in their names at the given path.
    If path is a directory, scans all files within it.
    If path is a file, checks and renames only that file.
    Returns the potentially new path of the file, or the original directory path.
    """
    if not os.path.exists(path):
        messagebox.showwarning("Warning", f"Input path does not exist: {path}")
        return path

    try:
        if os.path.isdir(path):
            # It's a directory, scan and rename files inside
            for filename in os.listdir(path):
                if re.search(r'\s', filename):
                    old_file_path = os.path.join(path, filename)
                    new_filename = re.sub(r'\s+', '-', filename)
                    new_file_path = os.path.join(path, new_filename)

                    if os.path.exists(new_file_path):
                        print(f"Skipping rename: target '{new_file_path}' already exists.")
                        continue
                    
                    os.rename(old_file_path, new_file_path)
            return path  # Return original directory path

        elif os.path.isfile(path):
            # It's a single file
            directory, filename = os.path.split(path)
            if re.search(r'\s', filename):
                new_filename = re.sub(r'\s+', '-', filename)
                new_path = os.path.join(directory, new_filename)

                if os.path.exists(new_path):
                    print(f"Skipping rename: target '{new_path}' already exists.")
                    return path  # Return original path if target exists
                
                os.rename(path, new_path)
                return new_path  # Return the NEW path
    except Exception as e:
        messagebox.showerror("Error", f"An error occurred during file renaming: {e}")
        return path
    
    return path # Return original path if no changes were needed

def browse_input_file():
    file_path = filedialog.askopenfilename(
        title="Select a PDF or Image File",
        filetypes=[
            ("Processable Files", "*.pdf *.png *.jpg *.jpeg *.bmp *.webp"),
            ("PDF Files", "*.pdf"),
            ("Image Files", "*.png *.jpg *.jpeg *.bmp *.webp")
        ]
    )
    if file_path:
        pdf_input_path_entry.delete(0, tk.END)
        pdf_input_path_entry.insert(0, file_path)

def browse_input_folder():
    folder_path = filedialog.askdirectory(title="Select a Folder with PDFs")
    if folder_path:
        pdf_input_path_entry.delete(0, tk.END)
        pdf_input_path_entry.insert(0, folder_path)

def browse_output_folder():
    folder_path = filedialog.askdirectory(title="Select an Output Folder")
    if folder_path:
        pdf_output_path_entry.delete(0, tk.END)
        pdf_output_path_entry.insert(0, folder_path)

def run_pdf_processing():
    """Prepares and runs the PDF processing via API after sanitizing filenames."""
    input_path_raw = pdf_input_path_entry.get().strip()
    output_path = pdf_output_path_entry.get().strip()

    if not input_path_raw or not output_path:
        messagebox.showwarning("Warning", "Please provide both input path and output folder path.")
        return

    # --- Automatically rename files before processing ---
    input_path = rename_files_in_path(input_path_raw)
    # Update the UI entry with the potentially new path
    pdf_input_path_entry.delete(0, tk.END)
    pdf_input_path_entry.insert(0, input_path)
    # --- End of auto-rename logic ---

    start_page_str = pdf_start_page_entry.get().strip()
    end_page_str = pdf_end_page_entry.get().strip()
    prefix_str = pdf_prefix_entry.get().strip()

    try:
        prefix = int(prefix_str) if prefix_str else 0
        first_page = int(start_page_str) + prefix if start_page_str else None
        last_page = int(end_page_str) + prefix if end_page_str else None
    except ValueError:
        messagebox.showwarning("Warning", "Page numbers and prefix must be integers.")
        return

    ocr_button.config(state=tk.DISABLED, text="Processing...")
    thread = threading.Thread(target=api_call_pdf_processing, args=(input_path, output_path, first_page, last_page))
    thread.start()

def api_call_pdf_processing(input_path, output_path, first_page, last_page):
    """Calls the /ocr/process_path endpoint."""
    try:
        payload = {
            "input_path": input_path,
            "output_path": output_path,
            "config": {
                "pdf_config": {
                    "first_page": first_page,
                    "last_page": last_page
                }
            }
        }
        response = requests.post("http://localhost:8000/ocr/process_path", json=payload, timeout=20)
        response.raise_for_status()
        
        res_json = response.json()
        root.after(0, lambda: messagebox.showinfo("Success", f"Processing started successfully on the server.\nInput: {res_json.get('input_path')}\nOutput: {res_json.get('output_path')}"))

    except requests.exceptions.RequestException as e:
        root.after(0, lambda: messagebox.showerror("Error", f"API request failed: {e}\n\nIs the flexible_app.py server running?"))
    except Exception as e:
        root.after(0, lambda: messagebox.showerror("Error", f"An error occurred during PDF processing: {e}"))
    finally:
        root.after(0, lambda: ocr_button.config(state=tk.NORMAL, text="DeepSeek OCR!"))

# ---------- OCR DISPATCHER ----------
def dispatch_ocr_action():
    """Checks the active tab and calls the appropriate OCR function."""
    selected_tab = notebook.tab(notebook.select(), "text")
    if selected_tab == "Image":
        run_image_ocr()
    elif selected_tab == "PDF":
        run_pdf_processing()

# ---------- UI SETUP ----------
root = tk.Tk()
root.title("OCR and LaTeX Converter v2.0")
root.geometry("900x800")

default_font = tkFont.Font(family="Consolas", size=12)
root.option_add("*Font", default_font)

main_frame = Frame(root)
main_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

# ==========================================
#               LEFT PANEL
# ==========================================
left_frame = Frame(main_frame, width=450)
left_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=(0, 10))
left_frame.pack_propagate(False)

# --- Notebook for Tabs ---
notebook = ttk.Notebook(left_frame)
notebook.pack(fill=tk.BOTH, expand=True)

# --- IMAGE TAB ---
image_tab_frame = Frame(notebook)
notebook.add(image_tab_frame, text="Image")

image_label = Label(image_tab_frame, text="Click here\n\nCtrl+V to \n\npaste image", relief=tk.RIDGE, bd=2,justify="center",anchor="center")
image_label.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
image_label.bind("<Control-v>", lambda e: paste_image())
image_label.bind("<Control-V>", lambda e: paste_image())
image_label.bind("<Button-1>", lambda e: e.widget.focus_set())

# --- PDF TAB ---
pdf_tab_frame = Frame(notebook)
notebook.add(pdf_tab_frame, text="PDF")

# Use a main frame with padding that will contain the grid
pdf_controls_frame = Frame(pdf_tab_frame)
pdf_controls_frame.pack(fill=tk.BOTH, expand=True, padx=15, pady=20)

# Configure grid columns. A single column that will expand.
pdf_controls_frame.columnconfigure(0, weight=1)

# --- Input Path ---
Label(pdf_controls_frame, text="Input Path:").grid(row=0, column=0, sticky="w", pady=(5, 0))

input_frame = Frame(pdf_controls_frame)
input_frame.grid(row=1, column=0, sticky="ew", pady=(0, 10))
input_frame.columnconfigure(0, weight=1) # Entry inside this frame should expand

pdf_input_path_entry = Entry(input_frame)
pdf_input_path_entry.grid(row=0, column=0, sticky="ew")

# Frame for buttons to keep them together
input_btn_frame = Frame(input_frame)
input_btn_frame.grid(row=0, column=1, sticky="e", padx=(5, 0))
Button(input_btn_frame, text="File", command=browse_input_file).pack(side=tk.LEFT)
Button(input_btn_frame, text="Folder", command=browse_input_folder).pack(side=tk.LEFT, padx=(2, 0))

# --- Output Path ---
Label(pdf_controls_frame, text="Output Folder:").grid(row=2, column=0, sticky="w", pady=(5, 0))

output_frame = Frame(pdf_controls_frame)
output_frame.grid(row=3, column=0, sticky="ew", pady=(0, 10))
output_frame.columnconfigure(0, weight=1) # Entry inside this frame should expand

pdf_output_path_entry = Entry(output_frame)
pdf_output_path_entry.grid(row=0, column=0, sticky="ew")
Button(output_frame, text="Browse...", command=browse_output_folder).grid(row=0, column=1, padx=(5, 0))

# --- Page Range ---
Label(pdf_controls_frame, text="Page Range (opt):").grid(row=4, column=0, sticky="w", pady=(5, 0))

page_frame = Frame(pdf_controls_frame)
page_frame.grid(row=5, column=0, sticky="w", pady=(0, 10))

# Prefix
Label(page_frame, text="Prefix:").grid(row=0, column=0, sticky="w", pady=(0, 2))
pdf_prefix_entry = Entry(page_frame, width=10)
pdf_prefix_entry.insert(0, "0") # Default value
pdf_prefix_entry.grid(row=0, column=1, sticky="w", padx=(5, 0), pady=(0, 2))

# Start
Label(page_frame, text="Start:").grid(row=1, column=0, sticky="w", pady=(0, 2))
pdf_start_page_entry = Entry(page_frame, width=10)
pdf_start_page_entry.grid(row=1, column=1, sticky="w", padx=(5, 0), pady=(0, 2))

# End
Label(page_frame, text="End:").grid(row=2, column=0, sticky="w", pady=(0, 2))
pdf_end_page_entry = Entry(page_frame, width=10)
pdf_end_page_entry.grid(row=2, column=1, sticky="w", padx=(5, 0), pady=(0, 2))


# --- Unified OCR Button ---
ocr_button = Button(left_frame, text="DeepSeek OCR!", command=dispatch_ocr_action, height=2, bg="#D0E0FF")
ocr_button.pack(fill=tk.X, pady=3)

# ==========================================
#               RIGHT PANEL
# ==========================================
right_frame = Frame(main_frame, width=450)
right_frame.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True)
right_frame.pack_propagate(False)

# --- Prompt Area ---
Label(right_frame, text="Prompt (for Image OCR):").pack(anchor="w")
prompt_text = Text(right_frame, height=2)
prompt_text.pack(fill=tk.X)
prompt_text.insert("1.0", "<|grounding|>Convert the document to markdown.")
prompt_text.bind("<Control-a>", select_all)

# --- Input Area ---
Label(right_frame, text="Input / OCR Result:").pack(anchor="w", pady=(10, 0))
input_text = Text(right_frame, height=2)
input_text.pack(fill=tk.BOTH, expand=True)
input_text.bind("<Control-a>", select_all)

# --- Output Area ---
Label(right_frame, text="Converted LaTeX:").pack(anchor="w", pady=(10, 0))
output_text = Text(right_frame, height=2)
output_text.pack(fill=tk.BOTH, expand=True)
output_text.bind("<Control-a>", select_all)

# --- Bottom Buttons ---
bottom_button_frame = Frame(right_frame)
bottom_button_frame.pack(fill=tk.X, pady=5)
Button(bottom_button_frame, text="Clear Input", command=clear_input).pack(side=tk.LEFT)
Button(bottom_button_frame, text="Convert", command=convert_action).pack(side=tk.LEFT, padx=5)
Button(bottom_button_frame, text="Copy Result", command=copy_to_clipboard).pack(side=tk.RIGHT)

root.mainloop()
```



### 简单逻辑 (只有 latex 转换)

{{CODE_BLOCK_1}}