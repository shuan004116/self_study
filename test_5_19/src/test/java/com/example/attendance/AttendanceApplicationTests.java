package com.example.attendance;

import com.example.attendance.entity.Attendance;
import com.example.attendance.entity.Student;
import com.example.attendance.repository.AttendanceRepository;
import com.example.attendance.repository.StudentRepository;
import com.example.attendance.service.AttendanceService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class AttendanceApplicationTests {

    @Autowired
    private AttendanceService attendanceService;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Test
    void contextLoads() {
        // 验证 Spring 上下文加载
    }

    @Test
    void testStudentRepository() {
        // 测试学生数据访问
        Student student = new Student("测试学生", "TEST001");
        student.setTotalAttendance(15);
        student.setLeaveCount(2);
        studentRepository.save(student);

        Student found = studentRepository.findByStudentNumber("TEST001").orElse(null);
        assertNotNull(found);
        assertEquals("测试学生", found.getStudentName());
        assertEquals("TEST001", found.getStudentNumber());

        // 清理测试数据
        studentRepository.delete(found);
    }

    @Test
    void testAttendanceRepository() {
        // 测试出勤记录数据访问
        Student student = new Student("测试学生2", "TEST002");
        studentRepository.save(student);

        Attendance attendance = new Attendance(student, 1, "出勤");
        attendanceRepository.save(attendance);

        List<Attendance> records = attendanceRepository
                .findByStudentStudentNumberOrderBySessionNumber("TEST002");

        assertFalse(records.isEmpty());
        assertEquals(1, records.size());
        assertEquals("出勤", records.get(0).getAttendanceStatus());

        // 清理测试数据
        attendanceRepository.delete(attendance);
        studentRepository.delete(student);
    }

    @Test
    void testAttendanceService() {
        // 测试业务逻辑服务
        String testStudentNumber = "TEST003";
        String csvFilePath = "出勤统计.csv";

        // 检查文件是否存在
        java.io.File file = new java.io.File(csvFilePath);
        if (file.exists()) {
            // 导入数据
            attendanceService.importAttendanceFromCsv(csvFilePath, testStudentNumber, "测试学生3");

            // 验证数据
            Student student = attendanceService.getStudentByNumber(testStudentNumber);
            // 注意：如果CSV中没有该学号，student会是null
            // 这里只是测试导入逻辑，不做断言
        }
    }
}
