# 出勤数据管理系统

使用Spring Boot + JPA + H2数据库实现的出勤数据管理程序。

## 功能特点

- 从CSV文件读取出勤数据
- 使用JPA将数据持久化到H2数据库
- 支持REST API查询数据
- 内置H2控制台，可在浏览器中查看数据

## 数据库设计

### 1. students表（学生信息表）
| 字段名 | 数据类型 | 说明 |
|--------|----------|------|
| id | BIGINT | 主键，自增 |
| student_name | VARCHAR(50) | 学生姓名 |
| student_number | VARCHAR(20) | 学号，唯一 |
| total_attendance | INT | 正常出勤次数 |
| leave_count | INT | 请假次数 |

### 2. attendance_records表（出勤记录表）
| 字段名 | 数据类型 | 说明 |
|--------|----------|------|
| id | BIGINT | 主键，自增 |
| student_id | BIGINT | 外键，关联students表 |
| session_number | INT | 出勤次数编号 |
| attendance_status | VARCHAR(10) | 出勤状态（出勤/缺勤/请假） |

## 使用方法

### 方法1：使用Maven命令行运行

```bash
# 1. 编译项目
mvn clean compile

# 2. 运行程序
mvn spring-boot:run
```

### 方法2：使用NetBeans运行

1. 在NetBeans中打开项目
2. 右键点击项目 -> Run
3. 程序将自动启动，读取CSV文件并导入数据

### 方法3：打包后运行

```bash
# 1. 打包项目
mvn clean package

# 2. 运行jar包
java -jar target/attendance-manager-1.0-SNAPSHOT.jar
```

## 查看数据

### 方法1：使用H2控制台（推荐）

1. 启动程序后，打开浏览器访问: http://localhost:8080/h2-console
2. 在登录页面：
   - JDBC URL: `jdbc:h2:file:./attendance_db`
   - User Name: `sa`
   - Password: (留空)
3. 点击"Connect"连接数据库
4. 在SQL编辑器中执行查询：
   ```sql
   -- 查看所有学生
   SELECT * FROM students;

   -- 查看出勤记录
   SELECT * FROM attendance_records;

   -- 查看指定学生的出勤详情
   SELECT s.student_number, s.student_name, a.session_number, a.attendance_status
   FROM students s
   JOIN attendance_records a ON s.id = a.student_id
   WHERE s.student_number = '120231140328'
   ORDER BY a.session_number;
   ```

### 方法2：使用REST API

```bash
# 获取所有学生
curl http://localhost:8080/api/attendance/students

# 查询指定学号的学生
curl http://localhost:8080/api/attendance/students/12023140328

# 获取统计数据
curl http://localhost:8080/api/attendance/statistics
```

## 项目结构

```
attendance-manager/
├── pom.xml                          # Maven配置文件
├── 出勤统计.csv                      # 原始数据文件
├── src/
│   └── main/
│       ├── java/
│       │   └── com/example/attendance/
│       │       ├── AttendanceApplication.java    # 主启动类
│       │       ├── controller/
│       │       │   └── AttendanceController.java  # REST控制器
│       │       ├── entity/
│       │       │   ├── Student.java               # 学生实体类
│       │       │   └── Attendance.java            # 出勤记录实体类
│       │       ├── repository/
│       │       │   ├── StudentRepository.java     # 学生数据访问接口
│       │       │   └── AttendanceRepository.java  # 出勤记录数据访问接口
│       │       ├── service/
│       │       │   └── AttendanceService.java     # 业务逻辑服务
│       │       └── runner/
│       │           ├── AttendanceDataRunner.java   # 数据导入启动器
│       │           └── DatabaseQueryRunner.java    # 数据查询测试
│       └── resources/
│           └── application.properties              # 应用配置文件
└── attendance_db.mv.db                               # H2数据库文件（运行后生成）
```

## 注意事项

1. **学号配置**：默认导入学号 `120231140328` 的数据，如需修改请修改 `AttendanceDataRunner.java` 中的 `targetStudentNumber` 变量

2. **CSV文件**：请确保 `出勤统计.csv` 文件在项目根目录下

3. **数据库文件**：程序运行后会在项目根目录生成 `attendance_db.mv.db` 文件，这是H2数据库文件

4. **端口配置**：默认使用8080端口，如需修改请在 `application.properties` 中配置 `server.port`

## 技术栈

- Java 17
- Spring Boot 3.2.0
- Spring Data JPA
- H2 Database
- Maven
