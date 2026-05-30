# 学生考勤查询系统

基于Spring Boot的学生考勤查询系统，使用Spring MVC和Thymeleaf视图技术。

## 技术栈

- Spring Boot 3.2.5
- Spring MVC
- Thymeleaf
- Spring Data JPA
- H2 Database

## 功能特性

1. **自动数据导入**：系统启动时自动将CSV考勤数据导入H2数据库
2. **学号查询**：输入学号查询个人考勤信息
3. **统计概览**：显示出勤率、出勤次数、缺勤次数、请假次数
4. **详细记录**：展示每次课程的出勤状态

## 运行方式

### 方式一：使用Maven命令运行

```bash
# 在项目根目录执行
mvn spring-boot:run
```

### 方式二：使用IDE运行

1. 导入项目到IDE（IntelliJ IDEA / Eclipse）
2. 运行 `AttendanceApplication.java` 主类

### 方式三：打包后运行

```bash
mvn clean package
java -jar target/attendance-0.0.1-SNAPSHOT.jar
```

## 访问地址

- **首页**：http://localhost:8888/chuqin/
- **H2控制台**：http://localhost:8888/chuqin/h2-console

## 项目结构

```
src/main/java/com/example/attendance/
├── AttendanceApplication.java      # 主启动类
├── entity/
│   ├── Student.java               # 学生实体
│   └── Attendance.java            # 考勤记录实体
├── repository/
│   ├── StudentRepository.java     # 学生数据访问
│   └── AttendanceRepository.java  # 考勤数据访问
├── service/
│   └── AttendanceService.java     # 业务逻辑服务
└── controller/
    └── AttendanceController.java  # 控制器

src/main/resources/
├── application.properties         # 配置文件
├── static/
│   └── 考勤统计.csv               # 考勤数据
└── templates/
    ├── index.html                 # 首页
    └── result.html                # 查询结果页
```

## 数据库表结构

### students 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键，自增 |
| student_id | VARCHAR | 学号（唯一） |
| name | VARCHAR | 姓名 |
| class_name | VARCHAR | 专业班级 |

### attendance 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键，自增 |
| student_id | BIGINT | 外键，关联students表 |
| class_date | DATE | 课程日期 |
| status | VARCHAR | 出勤状态（出勤/缺勤/请假） |

## 使用说明

1. 启动应用后，访问 http://localhost:8888/chuqin/
2. 在输入框中输入学号
3. 点击"查询"按钮
4. 查看考勤统计和详细记录
5. 点击"返回首页"按钮可返回重新查询
