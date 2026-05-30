-- ================================================
-- 出勤数据查询脚本
-- 在NetBeans的SQL编辑器中执行以下查询
-- ================================================

-- 1. 查看学生表结构
-- 执行后可以看到students表的列定义
SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'STUDENTS';
SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'STUDENTS';

-- 2. 查看出勤记录表结构
SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'ATTENDANCE_RECORDS';
SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'ATTENDANCE_RECORDS';

-- 3. 查看所有学生信息
SELECT * FROM students;

-- 4. 查看指定学生的出勤记录
-- 替换学号为你的学号
SELECT
    s.student_number AS 学号,
    s.student_name AS 姓名,
    a.session_number AS 出勤次数,
    a.attendance_status AS 出勤状态
FROM students s
JOIN attendance_records a ON s.id = a.student_id
WHERE s.student_number = '120231140328'
ORDER BY a.session_number;

-- 5. 统计指定学生的出勤情况
SELECT
    s.student_number AS 学号,
    s.student_name AS 姓名,
    COUNT(CASE WHEN a.attendance_status = '出勤' THEN 1 END) AS 出勤次数,
    COUNT(CASE WHEN a.attendance_status = '请假' THEN 1 END) AS 请假次数,
    COUNT(CASE WHEN a.attendance_status = '缺勤' THEN 1 END) AS 缺勤次数,
    COUNT(*) AS 总次数
FROM students s
JOIN attendance_records a ON s.id = a.student_id
WHERE s.student_number = '120231140328'
GROUP BY s.student_number, s.student_name;

-- 6. 查看所有学生的统计信息
SELECT
    s.student_number AS 学号,
    s.student_name AS 姓名,
    s.total_attendance AS 正常出勤次数,
    s.leave_count AS 请假次数,
    (SELECT COUNT(*) FROM attendance_records a WHERE a.student_id = s.id) AS 总次数
FROM students s
ORDER BY s.student_number;

-- 7. 查看出勤状态分布
SELECT
    attendance_status AS 出勤状态,
    COUNT(*) AS 次数
FROM attendance_records
GROUP BY attendance_status;

-- 8. 按出勤次数统计学生
SELECT
    s.total_attendance AS 正常出勤次数,
    COUNT(*) AS 学生人数
FROM students s
GROUP BY s.total_attendance
ORDER BY s.total_attendance DESC;
