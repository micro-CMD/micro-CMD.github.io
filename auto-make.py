#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import os
from datetime import datetime
import tkinter as tk
from tkinter import scrolledtext, messagebox, ttk

POSTS_DIR = './posts'
LIST_FILE = os.path.join(POSTS_DIR, 'list.json')

# 确保 posts 文件夹存在
os.makedirs(POSTS_DIR, exist_ok=True)

def read_list():
    if os.path.exists(LIST_FILE):
        with open(LIST_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

def write_list(data):
    with open(LIST_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

def generate_post():
    title = entry_title.get().strip()
    excerpt = entry_excerpt.get().strip()
    content = text_content.get("1.0", tk.END).strip().splitlines()
    # 去除末尾空行
    while content and content[-1] == '':
        content.pop()

    if not title:
        messagebox.showerror("错误", "标题不能为空")
        return
    if not excerpt:
        messagebox.showerror("错误", "摘要不能为空")
        return
    if not content:
        messagebox.showerror("错误", "正文不能为空")
        return

    today = datetime.now().strftime('%Y-%m-%d')
    list_data = read_list()
    max_id = max([item['id'] for item in list_data]) if list_data else 0
    new_id = max_id + 1

    total_chars = sum(len(line) for line in content)
    read_time = max(1, round(total_chars / 200))

    new_post = {
        "id": new_id,
        "title": title,
        "date": today,
        "readTime": read_time,
        "excerpt": excerpt
    }
    list_data.append(new_post)
    write_list(list_data)

    post_file = os.path.join(POSTS_DIR, f'{new_id}.json')
    post_data = {
        "id": new_id,
        "title": title,
        "date": today,
        "content": content
    }
    with open(post_file, 'w', encoding='utf-8') as f:
        json.dump(post_data, f, ensure_ascii=False, indent=4)

    messagebox.showinfo("成功", f"文章已创建！\nID: {new_id}\n文件: {post_file}\n日期: {today}")
    # 清空输入，方便下一篇
    entry_title.delete(0, tk.END)
    entry_excerpt.delete(0, tk.END)
    text_content.delete("1.0", tk.END)

# 创建主窗口
root = tk.Tk()
root.title("博客文章生成器")
root.geometry("600x500")
root.resizable(False, False)

# 标题
tk.Label(root, text="标题：", font=("微软雅黑", 12)).pack(pady=(10,0))
entry_title = tk.Entry(root, font=("微软雅黑", 12), width=50)
entry_title.pack(pady=5)

# 摘要
tk.Label(root, text="摘要（一句话）：", font=("微软雅黑", 12)).pack(pady=(10,0))
entry_excerpt = tk.Entry(root, font=("微软雅黑", 12), width=50)
entry_excerpt.pack(pady=5)

# 正文
tk.Label(root, text="正文（每行一段）：", font=("微软雅黑", 12)).pack(pady=(10,0))
text_content = scrolledtext.ScrolledText(root, font=("微软雅黑", 11), width=70, height=12)
text_content.pack(pady=5, padx=10)

# 按钮
btn_frame = tk.Frame(root)
btn_frame.pack(pady=15)
btn_generate = tk.Button(btn_frame, text="生成文章", font=("微软雅黑", 12), bg="#4a6cf7", fg="white", padx=20, command=generate_post)
btn_generate.pack(side=tk.LEFT, padx=10)
btn_quit = tk.Button(btn_frame, text="退出", font=("微软雅黑", 12), command=root.quit)
btn_quit.pack(side=tk.LEFT, padx=10)

root.mainloop()