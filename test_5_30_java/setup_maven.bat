@echo off
echo ========================================
echo    Maven环境变量配置说明
echo ========================================
echo.
echo 请手动执行以下步骤：
echo.
echo 1. 按 Win+R，输入 sysdm.cpl，回车
echo 2. 点击"高级"选项卡
echo 3. 点击"环境变量"按钮
echo.
echo 在"系统变量"区域：
echo.
echo 【新建变量】
echo    变量名：M2_HOME
echo    变量值：D:\maven
echo.
echo 【修改Path变量】
echo    点击"编辑" → "新建"
echo    添加：%M2_HOME%\bin
echo.
echo 配置完成后，打开新的命令行窗口，运行：
echo    mvn -version
echo.
echo ========================================
pause
