$Desktop = [Environment]::GetFolderPath('Desktop')
$ShortcutPath = Join-Path $Desktop '江见舟.lnk'
$TargetPath = 'e:\claude_test\jiang_jianzhou\launch.vbs'
$IconPath = 'e:\claude_test\jiang_jianzhou\static\icon.ico'

$WScriptShell = New-Object -ComObject WScript.Shell
$Shortcut = $WScriptShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = 'wscript.exe'
$Shortcut.Arguments = '"""' + $TargetPath + '"""'
$Shortcut.IconLocation = $IconPath
$Shortcut.WorkingDirectory = 'e:\claude_test\jiang_jianzhou'
$Shortcut.WindowStyle = 7
$Shortcut.Save()

Write-Output 'Shortcut created: ' $ShortcutPath
