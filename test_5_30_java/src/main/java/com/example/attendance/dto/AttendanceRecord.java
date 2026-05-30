package com.example.attendance.dto;

public class AttendanceRecord {
    private String date;
    private String status;

    public AttendanceRecord(String date, String status) {
        this.date = date;
        this.status = status;
    }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getStatusClass() {
        if ("出勤".equals(status)) return "present";
        if ("缺勤".equals(status)) return "absent";
        return "leave";
    }
}
