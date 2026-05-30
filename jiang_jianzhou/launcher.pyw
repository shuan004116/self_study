"""江见舟启动器 - 双击运行，无控制台窗口"""
import subprocess
import webbrowser
import time
import sys
import os

os.chdir(os.path.dirname(os.path.abspath(__file__)))

# 检查是否已有服务在运行
import socket
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
already_running = sock.connect_ex(('127.0.0.1', 8001)) == 0
sock.close()

if already_running:
    webbrowser.open('http://localhost:8001')
    sys.exit(0)

# 启动服务器
subprocess.Popen(
    [sys.executable, '-m', 'uvicorn', 'main:app', '--host', '127.0.0.1', '--port', '8001'],
    stdout=subprocess.DEVNULL,
    stderr=subprocess.DEVNULL,
    creationflags=subprocess.CREATE_NO_WINDOW if sys.platform == 'win32' else 0,
)

# 等待服务就绪后打开浏览器
for _ in range(30):
    time.sleep(0.5)
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    ready = sock.connect_ex(('127.0.0.1', 8001)) == 0
    sock.close()
    if ready:
        webbrowser.open('http://localhost:8001')
        sys.exit(0)

# 超时也尝试打开
webbrowser.open('http://localhost:8001')
