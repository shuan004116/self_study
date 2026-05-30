@echo off
REM Windows development startup script for Intelligent Tutor

echo === 智能学习助手 - 开发环境启动 ===
echo.

REM Check Python
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Python 已安装
) else (
    echo [ERR] 请安装 Python 3.10+
    pause
    exit /b 1
)

REM Start backend
echo.
echo 启动后端服务...
start "backend" cmd /c "uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000"

REM Start frontend if package.json exists
if exist "..\frontend\package.json" (
    echo 启动前端服务...
    start "frontend" cmd /c "cd ..\frontend && npm run dev"
)

echo.
echo 服务启动中...
echo 后端: http://localhost:8000
echo API文档: http://localhost:8000/docs
echo.
echo 按任意键停止所有服务...
pause
taskkill /f /fi "windowtitle eq backend" >nul 2>&1
taskkill /f /fi "windowtitle eq frontend" >nul 2>&1
