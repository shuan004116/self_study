package com.example.attendance.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "attendance_records")
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(name = "session_number", nullable = false)
    private Integer sessionNumber;

    @Column(name = "attendance_status", nullable = false, length = 10)
    private String attendanceStatus;

    // 构造函数
    public Attendance() {
    }

    public Attendance(Student student, Integer sessionNumber, String attendanceStatus) {
        this.student = student;
        this.sessionNumber = sessionNumber;
        this.attendanceStatus = attendanceStatus;
    }

    // Getter和Setter方法
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Student getStudent() {
        return student;
    }

    public void setStudent(Student student) {
        this.student = student;
    }

    public Integer getSessionNumber() {
        return sessionNumber;
    }

    public void setSessionNumber(Integer sessionNumber) {
        this.sessionNumber = sessionNumber;
    }

    public String getAttendanceStatus() {
        return attendanceStatus;
    }

    public void setAttendanceStatus(String attendanceStatus) {
        this.attendanceStatus = attendanceStatus;
    }

    @Override
    public String toString() {
        return "Attendance{" +
                "id=" + id +
                ", sessionNumber=" + sessionNumber +
                ", attendanceStatus='" + attendanceStatus + '\'' +
                '}';
    }
}
