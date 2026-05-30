package com.example.attendance.controller;

import com.example.attendance.entity.Attendance;
import com.example.attendance.entity.Student;
import com.example.attendance.repository.AttendanceRepository;
import com.example.attendance.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    /**
     * 获取所有学生列表
     */
    @GetMapping("/students")
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    /**
     * 根据学号查询学生信息
     */
    @GetMapping("/students/{studentNumber}")
    public Map<String, Object> getStudentByNumber(@PathVariable String studentNumber) {
        Map<String, Object> result = new HashMap<>();

        Student student = studentRepository.findByStudentNumber(studentNumber).orElse(null);
        if (student != null) {
            result.put("student", student);
            result.put("attendance", attendanceRepository
                    .findByStudentStudentNumberOrderBySessionNumber(studentNumber));
        } else {
            result.put("error", "未找到该学生");
        }

        return result;
    }

    /**
     * 获取所有学生的统计数据
     */
    @GetMapping("/statistics")
    public Map<String, Object> getStatistics() {
        Map<String, Object> statistics = new HashMap<>();

        List<Student> students = studentRepository.findAll();
        statistics.put("totalStudents", students.size());
        statistics.put("students", students);

        return statistics;
    }
}
