package com.example.attendance.controller;

import com.example.attendance.dto.AttendanceRecord;
import com.example.attendance.entity.Student;
import com.example.attendance.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@Controller
@RequestMapping("/")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @GetMapping
    public String index() {
        return "index";
    }

    @PostMapping("/query")
    public String query(@RequestParam("studentId") String studentId, Model model) {
        Student student = attendanceService.queryByStudentId(studentId.trim());
        if (student == null) {
            model.addAttribute("error", "学号不存在或不正确，请输入正确的学号！");
            return "index";
        }

        // Parse attendance string into records
        List<AttendanceRecord> records = new ArrayList<>();
        String[] items = student.getAttendanceInfo().split("; ");
        for (String item : items) {
            String[] parts = item.split(": ");
            if (parts.length == 2) {
                records.add(new AttendanceRecord(parts[0], parts[1]));
            }
        }

        model.addAttribute("student", student);
        model.addAttribute("records", records);
        model.addAttribute("totalCount", records.size());
        return "result";
    }
}
