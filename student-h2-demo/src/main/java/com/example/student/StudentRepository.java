package com.example.student;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class StudentRepository {

    private final JdbcTemplate jdbc;

    public StudentRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public void createTable() {
        jdbc.execute("""
            CREATE TABLE IF NOT EXISTS student (
                id          INT AUTO_INCREMENT PRIMARY KEY,
                student_no  VARCHAR(20)  NOT NULL,
                name        VARCHAR(50)  NOT NULL,
                class_name  VARCHAR(50)  NOT NULL,
                photo_file  VARCHAR(200)
            )
        """);
    }

    public int insert(Student s) {
        return jdbc.update(
            "INSERT INTO student (student_no, name, class_name, photo_file) VALUES (?, ?, ?, ?)",
            s.getStudentNo(), s.getName(), s.getClassName(), s.getPhotoFile()
        );
    }

    public List<Student> findAll() {
        return jdbc.query(
            "SELECT id, student_no, name, class_name, photo_file FROM student",
            (rs, rowNum) -> {
                Student s = new Student();
                s.setId(rs.getInt("id"));
                s.setStudentNo(rs.getString("student_no"));
                s.setName(rs.getString("name"));
                s.setClassName(rs.getString("class_name"));
                s.setPhotoFile(rs.getString("photo_file"));
                return s;
            }
        );
    }
}
