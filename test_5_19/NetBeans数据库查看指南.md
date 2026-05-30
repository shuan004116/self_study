# NetBeans数据库查看指南

## 步骤1：配置数据库连接

1. 打开NetBeans
2. 在左侧"Services"面板中，右键点击"Databases"
3. 选择"New Connection..."
4. 在"New Connection Wizard"中：
   - Driver: 选择"H2 (Embedded)"
   - 点击"Next >"
5. 在"New Connection"对话框中：
   - Database Path: 浏览到项目目录下的 `attendance_db.mv.db` 文件
   - User Name: `sa`
   - Password: (留空)
   - 点击"OK"
6. 连接成功后，你会在"Databases"下看到新创建的连接

## 步骤2：查看表结构

1. 展开数据库连接
2. 展开"TABLES"
3. 你会看到两个表：
   - `STUDENTS` - 学生信息表
   - `ATTENDANCE_RECORDS` - 出勤记录表

4. 右键点击表名，选择"View Data"查看表中的数据

## 步骤3：执行SQL查询

1. 右键点击数据库连接，选择"SQL Editor"
2. 在SQL编辑器中输入查询语句，例如：

```sql
-- 查看所有学生
SELECT * FROM students;

-- 查看指定学生的出勤记录
SELECT
    s.student_number AS 学号,
    s.student_name AS 姓名,
    a.session_number AS 出勤次数,
    a.attendance_status AS 出勤状态
FROM students s
JOIN attendance_records a ON s.id = a.student_id
WHERE s.student_number = '120231140328'
ORDER BY a.session_number;
```

3. 点击"Run"按钮或按Ctrl+Shift+Enter执行查询

## 步骤4：使用图形化界面查看

### 查看表结构
1. 双击表名打开表
2. 点击"Design"标签查看表结构
3. 点击"Data"标签查看数据

### 导出数据
1. 右键点击表名
2. 选择"Export Data"
3. 选择导出格式（CSV、Excel等）

## 常用查询语句

### 1. 查看学生表结构
```sql
SELECT * FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'STUDENTS';
```

### 2. 查看出勤记录表结构
```sql
SELECT * FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'ATTENDANCE_RECORDS';
```

### 3. 查看所有学生
```sql
SELECT * FROM students;
```

### 4. 查看指定学生的出勤详情
```sql
SELECT
    s.student_number,
    s.student_name,
    a.session_number,
    a.attendance_status
FROM students s
JOIN attendance_records a ON s.id = a.student_id
WHERE s.student_number = '120231140328'
ORDER BY a.session_number;
```

### 5. 统计学生出勤情况
```sql
SELECT
    s.student_number,
    s.student_name,
    COUNT(CASE WHEN a.attendance_status = '出勤' THEN 1 END) AS 出勤次数,
    COUNT(CASE WHEN a.attendance_status = '请假' THEN 1 END) AS 请假次数,
    COUNT(CASE WHEN a.attendance_status = '缺勤' THEN 1 END) AS 缺勤次数
FROM students s
JOIN attendance_records a ON s.id = a.student_id
WHERE s.student_number = '120231140328'
GROUP BY s.student_number, s.student_name;
```

### 6. 查看出勤状态分布
```sql
SELECT
    attendance_status,
    COUNT(*) AS 次数
FROM attendance_records
GROUP BY attendance_status;
```

## 故障排除

### 问题1：无法连接数据库
- 确保程序已经运行并生成了 `attendance_db.mv.db` 文件
- 检查数据库文件路径是否正确
- 确保没有其他程序正在使用该数据库文件

### 问题2：查询无结果
- 确保已经运行过程序并成功导入数据
- 检查学号是否正确
- 使用 `SELECT * FROM students;` 确认数据已导入

### 问题3：编码问题
- 如果看到乱码，确保SQL编辑器使用UTF-8编码
- 在NetBeans中：Tools -> Options -> Miscellaneous -> Encoding -> UTF-8

## 快捷键

- Ctrl+Shift+Enter: 执行SQL查询
- Ctrl+Shift+F: 格式化SQL代码
- Ctrl+/: 注释/取消注释
- Ctrl+Space: 代码补全
