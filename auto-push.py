#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import subprocess
import tkinter as tk
from tkinter import messagebox, scrolledtext
import threading
import os

def run_git_command(cmd, cwd=None):
    """执行 git 命令并返回输出"""
    try:
        result = subprocess.run(
            cmd,
            cwd=cwd or os.path.dirname(os.path.abspath(__file__)),
            capture_output=True,
            text=True,
            timeout=60,
            encoding='utf-8'
        )
        return result.stdout + result.stderr, result.returncode == 0
    except subprocess.TimeoutExpired:
        return "⏰ 命令执行超时（60秒），请检查网络连接", False
    except Exception as e:
        return f"❌ 执行出错: {str(e)}", False

def get_git_status(cwd=None):
    """检查是否有改动"""
    output, ok = run_git_command(['git', 'status', '--porcelain'], cwd)
    if not ok:
        return "", False
    lines = [line for line in output.split('\n') if line.strip()]
    return lines, True

def do_push():
    """执行一键提交推送"""
    # 禁用按钮，防止重复点击
    btn_push.config(state=tk.DISABLED, text="⏳ 处理中...")
    text_log.delete(1.0, tk.END)
    text_log.insert(tk.END, "🚀 开始一键提交...\n\n")

    # 在新线程中执行，避免界面卡死
    def worker():
        cwd = os.path.dirname(os.path.abspath(__file__))

        # 1. 检查是否有改动
        text_log.insert(tk.END, "📋 检查文件状态...\n")
        changes, ok = get_git_status(cwd)
        if not ok:
            text_log.insert(tk.END, "❌ 无法获取 Git 状态，请确认当前目录是 Git 仓库\n")
            btn_push.config(state=tk.NORMAL, text="🚀 一键提交并推送")
            return
        if not changes:
            text_log.insert(tk.END, "✅ 没有需要提交的改动，一切已是最新！\n")
            btn_push.config(state=tk.NORMAL, text="🚀 一键提交并推送")
            return
        text_log.insert(tk.END, f"📝 发现 {len(changes)} 个文件有改动:\n")
        for line in changes:
            text_log.insert(tk.END, f"   {line}\n")
        text_log.insert(tk.END, "\n")

        # 2. 获取提交信息
        commit_msg = entry_msg.get().strip()
        if not commit_msg:
            commit_msg = f"更新博客 {__import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M')}"

        # 3. git add .
        text_log.insert(tk.END, "📦 执行 git add . ...\n")
        output, ok = run_git_command(['git', 'add', '.'], cwd)
        if not ok:
            text_log.insert(tk.END, f"❌ git add 失败:\n{output}\n")
            btn_push.config(state=tk.NORMAL, text="🚀 一键提交并推送")
            return
        text_log.insert(tk.END, "✅ git add 完成\n\n")

        # 4. git commit
        text_log.insert(tk.END, f"📝 执行 git commit -m \"{commit_msg}\" ...\n")
        output, ok = run_git_command(['git', 'commit', '-m', commit_msg], cwd)
        if not ok:
            if "nothing to commit" in output:
                text_log.insert(tk.END, "ℹ️ 没有需要提交的内容（可能已经提交过了）\n")
            else:
                text_log.insert(tk.END, f"❌ git commit 失败:\n{output}\n")
                btn_push.config(state=tk.NORMAL, text="🚀 一键提交并推送")
                return
        text_log.insert(tk.END, "✅ git commit 完成\n\n")

        # 5. git push
        text_log.insert(tk.END, "☁️ 执行 git push（可能需要 1-3 分钟，请耐心等待...）\n")
        output, ok = run_git_command(['git', 'push'], cwd)
        if not ok:
            text_log.insert(tk.END, f"❌ git push 失败:\n{output}\n")
            text_log.insert(tk.END, "\n💡 可能原因：网络问题或需要先 git pull\n")
            btn_push.config(state=tk.NORMAL, text="🚀 一键提交并推送")
            return

        # 成功
        text_log.insert(tk.END, "✅ git push 完成！\n\n")
        text_log.insert(tk.END, "🎉 所有改动已成功推送到 GitHub！\n")
        text_log.insert(tk.END, f"⏰ 时间: {__import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        text_log.insert(tk.END, f"📝 提交信息: {commit_msg}\n")
        text_log.see(tk.END)
        btn_push.config(state=tk.NORMAL, text="🚀 一键提交并推送")
        messagebox.showinfo("成功", "🎉 提交推送完成！\n博客将在 1-2 分钟后更新。")

    threading.Thread(target=worker, daemon=True).start()

def refresh_status():
    """刷新状态显示"""
    cwd = os.path.dirname(os.path.abspath(__file__))
    changes, ok = get_git_status(cwd)
    if not ok:
        lbl_status.config(text="❌ 不是 Git 仓库")
        return
    if changes:
        lbl_status.config(text=f"📝 {len(changes)} 个文件待提交", fg="orange")
    else:
        lbl_status.config(text="✅ 工作区干净，没有待提交内容", fg="green")

# 创建窗口
root = tk.Tk()
root.title("一键提交博客到 GitHub")
root.geometry("650x550")
root.resizable(False, False)

# 提示
tk.Label(root, text="📝 一键提交博客到 GitHub", font=("微软雅黑", 16, "bold")).pack(pady=10)

# 提交信息输入
frame_msg = tk.Frame(root)
frame_msg.pack(pady=10, padx=20, fill="x")
tk.Label(frame_msg, text="提交信息：", font=("微软雅黑", 11)).pack(side=tk.LEFT)
entry_msg = tk.Entry(frame_msg, font=("微软雅黑", 11), width=40)
entry_msg.pack(side=tk.LEFT, padx=10)
entry_msg.insert(0, "更新博客内容")

# 按钮
btn_push = tk.Button(root, text="🚀 一键提交并推送", font=("微软雅黑", 14), bg="#4a6cf7", fg="white", padx=20, pady=8, command=do_push)
btn_push.pack(pady=10)

# 状态栏
lbl_status = tk.Label(root, text="检查中...", font=("微软雅黑", 10))
lbl_status.pack()
btn_refresh = tk.Button(root, text="刷新状态", font=("微软雅黑", 9), command=refresh_status)
btn_refresh.pack(pady=5)

# 日志输出区
tk.Label(root, text="📋 执行日志：", font=("微软雅黑", 11)).pack(anchor="w", padx=20)
text_log = scrolledtext.ScrolledText(root, font=("Consolas", 10), height=18, bg="#f8f8f8")
text_log.pack(padx=20, pady=5, fill="both", expand=True)

# 底部提示
tk.Label(root, text="提示：执行过程中不要关闭窗口，大约需要 1-3 分钟", font=("微软雅黑", 9), fg="gray").pack(pady=5)

# 自动刷新状态
refresh_status()

root.mainloop()