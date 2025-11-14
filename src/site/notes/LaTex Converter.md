---
{"dg-path":"模型部署/LaTex Converter.py.md","tags":["Code"],"dg-publish":true,"permalink":"/模型部署/LaTex Converter.py/","dgPassFrontmatter":true,"noteIcon":"","created":"2025-11-14T16:54:39.720+08:00","updated":"2025-11-14T17:19:01.753+08:00"}
---



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

    math_unicode_pattern = r'[\U0001D434-\U0001D467\U0001D6A8-\U0001D6E1\U0001D7EC-\U0001D7F6]+(?:\[[^\]]+\])?'
    text = re.sub(math_unicode_pattern, convert_char, text)
    return text

def convert_latex(text):
    """最简 LaTeX 转换"""
    text = re.sub(r'\\\[([\s\S]*?)\\\]', r'$\1$', text)
    text = re.sub(r'\\\(([\s\S]*?)\\\)', r'$\1, text)
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
```