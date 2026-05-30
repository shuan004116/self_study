@echo off
chcp 65001 >nul
title 智能学习助手
cd /d "%~dp0"

echo ========================================
echo    智能学习助手 - 正在启动...
echo ========================================
echo.

REM 检测 Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    py --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo [错误] 未找到 Python，请确保已安装 Python 3.8+
        pause
        exit /b 1
    )
    set PYTHON_CMD=py -3
) else (
    set PYTHON_CMD=python
)
echo [OK] %PYTHON_CMD% 已就绪

REM 启动后端服务（不弹新窗口）
echo [1/2] 启动后端服务...
start /b "" %PYTHON_CMD% -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 > backend.log 2>&1

REM 等待服务启动
echo [2/2] 正在打开浏览器...
timeout /t 4 /nobreak >nul
start http://localhost:8000

echo.
echo ========================================
echo  服务已启动！
echo  访问地址: http://localhost:8000
echo.
echo  按 Ctrl+C 或关闭此窗口停止服务
echo ========================================
echo.

:wait
timeout /t 60 /nobreak >nul
goto wait
