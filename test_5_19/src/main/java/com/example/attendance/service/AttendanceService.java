package com.example.attendance.service;

import com.example.attendance.entity.Attendance;
import com.example.attendance.entity.Student;
import com.example.attendance.repository.AttendanceRepository;
import com.example.attendance.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Service
public class AttendanceService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    /**
     * 从CSV文件读取并保存指定学号的出勤数据
     * @param csvFilePath CSV文件路径
     * @param targetStudentNumber 目标学号
     * @param studentName 学生姓名（如果CSV中没有）
     */
    @Transactional
    public void importAttendanceFromCsv(String csvFilePath, String targetStudentNumber, String studentName) {
        System.out.println("开始导入出勤数据...");
        System.out.println("目标学号: " + targetStudentNumber);

        List<String[]> csvData = readCsvFile(csvFilePath);

        // 查找目标学号的数据
        for (String[] row : csvData) {
            if (row.length > 1 && row[1].trim().equals(targetStudentNumber)) {
                saveStudentAttendance(row, studentName);
                System.out.println("数据导入成功！");
                return;
            }
        }

        System.out.println("未找到学号为 " + targetStudentNumber + " 的学生数据");
    }

    /**
     * 读取CSV文件
     */
    private List<String[]> readCsvFile(String filePath) {
        List<String[]> data = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(
                new FileReader(filePath, StandardCharsets.UTF_8))) {

            String line;
            boolean isFirstLine = true;

            while ((line = reader.readLine()) != null) {
                // 跳过表头
                if (isFirstLine) {
                    isFirstLine = false;
                    continue;
                }

                // 处理BOM标记
                if (line.startsWith("﻿")) {
                    line = line.substring(1);
                }

                // 分割CSV行
                String[] parts = line.split(",");
                if (parts.length > 0) {
                    data.add(parts);
                }
            }

        } catch (IOException e) {
            e.printStackTrace();
            System.err.println("读取CSV文件失败: " + e.getMessage());
        }

        return data;
    }

    /**
     * 保存学生出勤数据到数据库
     */
    @Transactional
    public void saveStudentAttendance(String[] csvRow, String studentName) {
        String studentNumber = csvRow[1].trim();

        // 检查学生是否已存在
        Student student;
        if (studentRepository.existsByStudentNumber(studentNumber)) {
            student = studentRepository.findByStudentNumber(studentNumber).get();
            System.out.println("学生已存在，更新数据: " + studentNumber);
        } else {
            student = new Student(studentName, studentNumber);
            System.out.println("创建新学生: " + studentNumber);
        }

        // 统计出勤情况
        int totalAttendance = 0;
        int leaveCount = 0;

        // 存储每次出勤记录
        List<Attendance> attendanceList = new ArrayList<>();

        // 从CSV第3列开始是出勤数据（列索引2开始）
        for (int i = 2; i < csvRow.length; i++) {
            String status = csvRow[i].trim();
            int sessionNumber = i - 1; // 第1次出勤，第2次出勤...

            // 统计
            if (status.equals("出勤")) {
                totalAttendance++;
            } else if (status.equals("请假")) {
                leaveCount++;
            }
            // 缺勤不计入任何统计

            // 创建出勤记录
            Attendance attendance = new Attendance(student, sessionNumber, status);
            attendanceList.add(attendance);
        }

        // 更新学生统计信息
        student.setTotalAttendance(totalAttendance);
        student.setLeaveCount(leaveCount);
        student.setAttendanceList(attendanceList);

        // 保存到数据库
        studentRepository.save(student);
        attendanceRepository.saveAll(attendanceList);

        System.out.println("保存成功！");
        printStudentInfo(student, attendanceList);
    }

    /**
     * 打印学生信息
     */
    private void printStudentInfo(Student student, List<Attendance> attendanceList) {
        System.out.println("\n=== 学生出勤信息 ===");
        System.out.println("学号: " + student.getStudentNumber());
        System.out.println("姓名: " + student.getStudentName());
        System.out.println("正常出勤次数: " + student.getTotalAttendance());
        System.out.println("请假次数: " + student.getLeaveCount());

        int absentCount = 0;
        for (Attendance att : attendanceList) {
            if (att.getAttendanceStatus().equals("缺勤")) {
                absentCount++;
            }
        }
        System.out.println("缺勤次数: " + absentCount);
        System.out.println("总次数: " + attendanceList.size());

        System.out.println("\n出勤详情:");
        for (Attendance att : attendanceList) {
            System.out.println("  第" + att.getSessionNumber() + "次: " + att.getAttendanceStatus());
        }
        System.out.println("====================\n");
    }

    /**
     * 查询指定学号的出勤数据
     */
    public Student getStudentByNumber(String studentNumber) {
        return studentRepository.findByStudentNumber(studentNumber).orElse(null);
    }

    /**
     * 查询指定学号的所有出勤记录
     */
    public List<Attendance> getAttendanceByStudentNumber(String studentNumber) {
        return attendanceRepository.findByStudentStudentNumberOrderBySessionNumber(studentNumber);
    }
}
