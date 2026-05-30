# 后台静默启动（无窗口）
Set-Location e:\claude_test\intelligent-tutor
$pythonCmd = "python"
try { & $pythonCmd --version | Out-Null } catch { $pythonCmd = "py -3" }
Start-Job -Name "TutorBackend" -ScriptBlock { param($c) Invoke-Expression "$c -m uvicorn backend.main:app --host 0.0.0.0 --port 8000" } -ArgumentList $pythonCmd | Out-Null
Start-Sleep -Seconds 4
Start-Process "http://localhost:8000"
