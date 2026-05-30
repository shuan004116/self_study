package com.example.student;

public class Student {
    private Integer id;
    private String studentNo;
    private String name;
    private String className;
    private String photoFile;

    public Student() {}

    public Student(String studentNo, String name, String className, String photoFile) {
        this.studentNo = studentNo;
        this.name = name;
        this.className = className;
        this.photoFile = photoFile;
    }

    // --- Getters & Setters ---
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getStudentNo() { return studentNo; }
    public void setStudentNo(String studentNo) { this.studentNo = studentNo; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }

    public String getPhotoFile() { return photoFile; }
    public void setPhotoFile(String photoFile) { this.photoFile = photoFile; }

    @Override
    public String toString() {
        return String.format("| %-4s | %-12s | %-8s | %-16s | %-20s |",
                id, studentNo, name, className, photoFile);
    }
}
