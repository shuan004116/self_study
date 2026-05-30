@echo off
echo ========================================
echo    出勤数据管理系统启动脚本
echo ========================================
echo.

REM 检查Java是否安装
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未找到Java，请先安装Java 17或更高版本
    pause
    exit /b 1
)

REM 检查Maven是否安装
mvn -version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未找到Maven，请先安装Maven
    pause
    exit /b 1
)

echo [1/3] 编译项目...
call mvn clean compile -q
if %errorlevel% neq 0 (
    echo 编译失败！
    pause
    exit /b 1
)

echo [2/3] 运行程序...
echo.
echo 程序启动后，请访问以下地址查看数据：
echo - H2控制台: http://localhost:8080/h2-console
echo - REST API: http://localhost:8080/api/attendance/students
echo.
echo 按 Ctrl+C 停止程序
echo ========================================
echo.

call mvn spring-boot:run
