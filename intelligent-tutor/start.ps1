# 智能学习助手 - 启动脚本
# 右键 → "Run with PowerShell" 或通过快捷方式启动

$ErrorActionPreference = "SilentlyContinue"
$Host.UI.RawUI.WindowTitle = "智能学习助手"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   智能学习助手 - 正在启动..." -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# 切换到项目目录
Set-Location (Split-Path $MyInvocation.MyCommand.Path)

# 检测 Python
$pythonCmd = "python"
try {
    $ver = & $pythonCmd --version
    Write-Host "[OK] $ver" -ForegroundColor Green
} catch {
    try {
        $ver = & "py" -3 --version
        $pythonCmd = "py -3"
        Write-Host "[OK] $ver" -ForegroundColor Green
    } catch {
        Write-Host "[错误] 未找到 Python，请确保已安装 Python 3.8+" -ForegroundColor Red
        Read-Host "按回车退出"
        exit 1
    }
}

# 启动后端
Write-Host "[1/2] 启动后端服务..." -ForegroundColor Yellow
$job = Start-Job -ScriptBlock {
    param($cmd)
    Invoke-Expression "$cmd -m uvicorn backend.main:app --host 0.0.0.0 --port 8000"
} -ArgumentList $pythonCmd

Start-Sleep -Seconds 4

# 打开浏览器
Write-Host "[2/2] 正在打开浏览器..." -ForegroundColor Yellow
Start-Process "http://localhost:8000"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host " 服务已启动！访问地址: http://localhost:8000" -ForegroundColor Green
Write-Host " 关闭此窗口即可停止服务" -ForegroundColor Gray
Write-Host "========================================`n" -ForegroundColor Cyan

# 保持窗口打开，等待用户关闭
Read-Host "按回车停止服务"

# 停止后端
Stop-Job $job
Remove-Job $job
