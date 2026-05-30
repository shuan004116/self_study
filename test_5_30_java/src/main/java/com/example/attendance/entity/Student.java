package com.example.attendance.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "student")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String studentId;

    @Column(nullable = false)
    private String majorClass;

    @Column(nullable = false, length = 1000)
    private String attendanceInfo;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getMajorClass() { return majorClass; }
    public void setMajorClass(String majorClass) { this.majorClass = majorClass; }

    public String getAttendanceInfo() { return attendanceInfo; }
    public void setAttendanceInfo(String attendanceInfo) { this.attendanceInfo = attendanceInfo; }
}
