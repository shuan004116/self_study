Set WshShell = CreateObject("WScript.Shell")
Set FSO = CreateObject("Scripting.FileSystemObject")

ProjectPath = FSO.GetParentFolderName(WScript.ScriptFullName)
WshShell.CurrentDirectory = ProjectPath

' 启动服务器（隐藏窗口）
WshShell.Run "cmd /c python -m uvicorn main:app --host 127.0.0.1 --port 8001", 0, False

' 等一下
WScript.Sleep 3000

' 打开浏览器
WshShell.Run "http://localhost:8001"
