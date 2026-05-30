CREATE TABLE IF NOT EXISTS student (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    student_no  VARCHAR(20)  NOT NULL COMMENT '学号',
    name        VARCHAR(50)  NOT NULL COMMENT '姓名',
    class_name  VARCHAR(50)  NOT NULL COMMENT '班级',
    photo_file  VARCHAR(200)          COMMENT '照片文件名'
);
