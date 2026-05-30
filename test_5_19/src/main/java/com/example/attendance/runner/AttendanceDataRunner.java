package com.example.attendance.runner;

import com.example.attendance.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.File;

@Component
@Order(1)
public class AttendanceDataRunner implements CommandLineRunner {

    @Autowired
    private AttendanceService attendanceService;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("=== 出勤数据导入程序启动 ===");

        // 目标学号
        String targetStudentNumber = "120231140328";
        String studentName = "学生";

        // CSV文件路径
        String csvFilePath = "出勤统计.csv";

        // 检查文件是否存在
        File file = new File(csvFilePath);
        if (!file.exists()) {
            System.err.println("CSV文件不存在: " + csvFilePath);
            System.err.println("请将文件放在项目根目录下");
            return;
        }

        System.out.println("CSV文件路径: " + file.getAbsolutePath());

        try {
            // 导入数据
            attendanceService.importAttendanceFromCsv(csvFilePath, targetStudentNumber, studentName);

            // 查询并显示数据
            System.out.println("\n=== 从数据库查询数据 ===");
            var student = attendanceService.getStudentByNumber(targetStudentNumber);
            if (student != null) {
                System.out.println("查询成功！");
                System.out.println("学号: " + student.getStudentNumber());
                System.out.println("姓名: " + student.getStudentName());
                System.out.println("正常出勤次数: " + student.getTotalAttendance());
                System.out.println("请假次数: " + student.getLeaveCount());
            } else {
                System.out.println("未找到该学生的数据");
            }

        } catch (Exception e) {
            System.err.println("数据导入失败: " + e.getMessage());
            e.printStackTrace();
        }

        System.out.println("=== 数据导入完成 ===");
    }
}
