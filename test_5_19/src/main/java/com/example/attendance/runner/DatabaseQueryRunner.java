package com.example.attendance.runner;

import com.example.attendance.entity.Attendance;
import com.example.attendance.entity.Student;
import com.example.attendance.repository.AttendanceRepository;
import com.example.attendance.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Order(2)
public class DatabaseQueryRunner implements CommandLineRunner {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("\n====================================");
        System.out.println("       数据库查询测试");
        System.out.println("====================================\n");

        // 查询所有学生
        List<Student> allStudents = studentRepository.findAll();
        System.out.println("数据库中的学生总数: " + allStudents.size());

        // 查询指定学生的出勤记录
        String targetStudentNumber = "120231140328";
        List<Attendance> attendanceList = attendanceRepository
                .findByStudentStudentNumberOrderBySessionNumber(targetStudentNumber);

        if (!attendanceList.isEmpty()) {
            System.out.println("\n学号 " + targetStudentNumber + " 的出勤记录:");
            System.out.println("共 " + attendanceList.size() + " 条记录");

            int presentCount = 0;
            int leaveCount = 0;
            int absentCount = 0;

            for (Attendance att : attendanceList) {
                System.out.printf("  第%2d次: %s\n",
                        att.getSessionNumber(), att.getAttendanceStatus());

                switch (att.getAttendanceStatus()) {
                    case "出勤":
                        presentCount++;
                        break;
                    case "请假":
                        leaveCount++;
                        break;
                    case "缺勤":
                        absentCount++;
                        break;
                }
            }

            System.out.println("\n统计结果:");
            System.out.println("  出勤次数: " + presentCount);
            System.out.println("  请假次数: " + leaveCount);
            System.out.println("  缺勤次数: " + absentCount);
            System.out.println("  总次数: " + attendanceList.size());
        } else {
            System.out.println("未找到学号 " + targetStudentNumber + " 的出勤记录");
        }

        System.out.println("\n====================================");
        System.out.println("       查询完成");
        System.out.println("====================================\n");
    }
}
