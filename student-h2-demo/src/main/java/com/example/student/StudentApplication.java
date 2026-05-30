package com.example.student;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.util.List;

@SpringBootApplication
public class StudentApplication {

    public static void main(String[] args) {
        SpringApplication.run(StudentApplication.class, args);
    }

    @Bean
    CommandLineRunner run(StudentRepository repo) {
        return args -> {
            // 插入个人信息（请根据实际情况修改以下内容）
            Student me = new Student("120231140328", "汤爽", "信管2302", "头像.jpeg");
            repo.insert(me);
            System.out.println(">>> 信息已写入 H2 数据库。\n");

            // 从数据库读取并显示
            List<Student> list = repo.findAll();
            System.out.println("┌──────┬──────────────┬──────────┬──────────────────┬──────────────────────┐");
            System.out.println("│ ID   │ 学号         │ 姓名     │ 班级             │ 照片文件             │");
            System.out.println("├──────┼──────────────┼──────────┼──────────────────┼──────────────────────┤");
            for (Student s : list) {
                System.out.println(s);
            }
            System.out.println("└──────┴──────────────┴──────────┴──────────────────┴──────────────────────┘");
        };
    }
}
