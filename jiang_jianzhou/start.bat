@echo off
chcp 65001 >nul
title 江见舟 - AI Chat
cd /d "%~dp0"

if not exist "config.json" (
    echo {} > config.json
)

echo.
echo  ╔══════════════════════════════╗
echo  ║    🌸 江见舟 AI Chat 🌸     ║
echo  ║   你的傲娇猫系少女上线中... ║
echo  ╚══════════════════════════════╝
echo.
echo  正在启动...
echo.

rem 把切换目录和启动命令写入临时脚本，避免嵌套引号问题
set TMPVBS=%TEMP%\xjz_launch.vbs
> "%TMPVBS%" echo Set WshShell = CreateObject("WScript.Shell")
>> "%TMPVBS%" echo WshShell.CurrentDirectory = "%~dp0"
>> "%TMPVBS%" echo WshShell.Run "cmd /c python -m uvicorn main:app --host 127.0.0.1 --port 8001", 0
>> "%TMPVBS%" echo WScript.Sleep 2000
>> "%TMPVBS%" echo WshShell.Run "http://localhost:8001"

wscript //B "%TMPVBS%"
del "%TMPVBS%"

echo  小江已上线~ 浏览器应该自动打开了
echo  没打开的话手动访问 http://localhost:8001
echo.
