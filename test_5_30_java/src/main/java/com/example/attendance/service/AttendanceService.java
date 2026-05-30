package com.example.attendance.service;

import com.example.attendance.entity.Student;
import com.example.attendance.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class AttendanceService implements CommandLineRunner {

    @Autowired
    private StudentRepository studentRepository;

    @Override
    public void run(String... args) throws Exception {
        if (studentRepository.count() == 0) {
            loadData();
        }
    }

    private void loadData() throws Exception {
        ClassPathResource resource = new ClassPathResource("data.csv");
        BufferedReader reader = new BufferedReader(
                new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8));

        List<String> lines = new ArrayList<>();
        String line;
        while ((line = reader.readLine()) != null) {
            // Remove BOM from first line if present (U+FEFF)
            if (lines.isEmpty() && !line.isEmpty() && line.charAt(0) == 0xFEFF) {
                line = line.substring(1);
            }
            lines.add(line);
        }
        reader.close();

        // Step 1: Extract dates by scanning ALL lines for YYYY.MM.DD pattern
        // The header spans multiple lines, each date appears as "2026.03.03
        // followed by "创建时间：..." on the same or next line
        List<String> dates = new ArrayList<>();
        Pattern datePattern = Pattern.compile("(\\d{4}\\.\\d{2}\\.\\d{2})");
        for (String l : lines) {
            Matcher m = datePattern.matcher(l);
            while (m.find()) {
                dates.add(m.group(1));
            }
        }

        // Step 2: Find data rows (start with a number)
        int dataStart = -1;
        for (int i = 0; i < lines.size(); i++) {
            String l = lines.get(i).trim();
            if (!l.isEmpty() && l.charAt(0) >= '0' && l.charAt(0) <= '9' && l.contains(",")) {
                dataStart = i;
                break;
            }
        }

        if (dataStart == -1 || dates.isEmpty()) {
            System.out.println("ERROR: Could not parse CSV. dates=" + dates.size() + " dataStart=" + dataStart);
            return;
        }

        System.out.println("=== CSV DEBUG ===");
        System.out.println("Dates found: " + dates.size());
        for (int i = 0; i < dates.size(); i++) {
            System.out.println("  " + (i + 1) + ". " + dates.get(i));
        }

        // Step 3: Parse each data row
        int loadedCount = 0;
        for (int i = dataStart; i < lines.size(); i++) {
            String dataLine = lines.get(i).trim();
            if (dataLine.isEmpty()) continue;

            String[] dataParts = dataLine.split(",");
            if (dataParts.length < 4) continue;

            String studentId = dataParts[1].trim();
            String majorClass = dataParts[2].trim();

            // Build attendance: "date1: status1; date2: status2; ..."
            StringBuilder attendance = new StringBuilder();
            for (int j = 3; j < dataParts.length && (j - 3) < dates.size(); j++) {
                String date = dates.get(j - 3);
                String status = dataParts[j].trim();
                if (attendance.length() > 0) {
                    attendance.append("; ");
                }
                attendance.append(date).append(": ").append(status);
            }

            Student student = new Student();
            student.setName("学生");
            student.setStudentId(studentId);
            student.setMajorClass(majorClass);
            student.setAttendanceInfo(attendance.toString());
            studentRepository.save(student);
            loadedCount++;

            if (loadedCount <= 2) {
                System.out.println("Sample: " + studentId + " / " + majorClass + " / records=" + (dataParts.length - 3));
                System.out.println("  attendance=" + attendance.substring(0, Math.min(120, attendance.length())) + "...");
            }
        }

        System.out.println("Total loaded: " + loadedCount + " students");
        System.out.println("=== END DEBUG ===");
    }

    public Student queryByStudentId(String studentId) {
        return studentRepository.findByStudentId(studentId);
    }
}
