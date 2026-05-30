# Git & GitHub 使用指南

> 📌 本文档是你的 GitHub 入门手册，忘了随时查看。

---

## 一、核心概念

```
你的电脑（本地）  ←→  GitHub（云端）
     ↓                    ↓
   Git 工具            网站/仓库
```

- **Git** = 本地的版本控制工具（记录代码历史）
- **GitHub** = 云端的代码托管平台（备份+协作+展示）

---

## 二、首次设置（只做一次）

### 1. 安装 Git
Windows 下载：https://git-scm.com/download/win
安装时全部保持默认选项，点 Next 即可。

### 2. 配置身份信息
```bash
git config --global user.name "你的GitHub用户名"
git config --global user.email "你的GitHub邮箱"
```

### 3. 生成 SSH 密钥（可选，推荐）
用于免密码上传代码：
```bash
ssh-keygen -t ed25519 -C "你的邮箱"
```
一路回车，然后把公钥添加到 GitHub：
- 复制 `~/.ssh/id_ed25519.pub` 文件内容
- GitHub → Settings → SSH and GPG keys → New SSH key → 粘贴

---

## 三、日常使用流程

### 场景 1：把已有项目上传到 GitHub

```bash
# 1. 进入项目文件夹
cd /e/claude_test/jiang_jianzhou

# 2. 初始化 git（只做一次）
git init

# 3. 添加所有文件到暂存区
git add .

# 4. 提交（创建存档点）
git commit -m "第一次提交：AI对话项目"

# 5. 关联远程仓库
git remote add origin https://github.com/用户名/仓库名.git

# 6. 上传
git push -u origin main
```

### 场景 2：日常修改后提交（最常用！）

```bash
# 1. 查看改了哪些文件
git status

# 2. 添加所有修改
git add .

# 3. 提交（写清楚改了什么）
git commit -m "修复了xxx问题"

# 4. 上传
git push
```

**就这么简单！** 每次改完代码，跑这 4 行就行。

### 场景 3：从 GitHub 下载项目到本地

```bash
# 方法1：用 HTTPS（推荐新手）
git clone https://github.com/用户名/仓库名.git

# 方法2：用 SSH（需要配置密钥）
git clone git@github.com:用户名/仓库名.git
```

---

## 四、常用命令速查表

| 命令 | 作用 | 什么时候用 |
|------|------|-----------|
| `git init` | 初始化仓库 | 第一次进入新项目 |
| `git add .` | 添加所有文件 | 提交前 |
| `git add 文件名` | 添加指定文件 | 只想提交部分文件 |
| `git commit -m "说明"` | 创建存档点 | 每次改完代码 |
| `git status` | 查看状态 | 随时看 |
| `git push` | 上传到 GitHub | 每次 commit 后 |
| `git pull` | 从 GitHub 下载更新 | 想获取最新代码 |
| `git log` | 查看历史记录 | 想看提交历史 |
| `git diff` | 查看具体改了什么 | 提交前检查 |

---

## 五、常见问题

### Q1：push 失败？
```bash
# 先拉取最新代码
git pull --rebase origin main
# 再 push
git push
```

### Q2：不想提交某些文件？
创建 `.gitignore` 文件，列出忽略的文件：
```
__pycache__/
*.pyc
.env
node_modules/
```

### Q3：提交信息写错了？
```bash
# 修改最后一次提交信息
git commit --amend -m "新的提交信息"
```

### Q4：想回退到之前的版本？
```bash
# 查看历史
git log --oneline
# 回退到某个提交
git reset --hard 提交ID
```

---

## 六、推荐工作流

```
每天开始：git pull（获取最新）
    ↓
写代码、改bug...
    ↓
git add . → git commit -m "说明" → git push
    ↓
每天结束前：再 push 一次
```

---

## 七、练习建议

1. **先用一个测试仓库练习**，熟练了再用正式项目
2. **写清楚提交信息**，如 "修复登录bug"、"添加用户注册功能"
3. **每次完成一个功能就提交**，不要攒太多再提交
4. **经常 push**，避免本地代码丢失

---

## 八、GitHub 网页操作指南

### 1. 创建仓库

1. 登录 GitHub：https://github.com
2. 点击右上角 `+` → `New repository`
3. 填写信息：
   - **Repository name**：仓库名（如 `jiang_jianzhou`）
   - **Description**：描述（可选）
   - **Public**：公开（别人能看到）
   - **Private**：私有（只有你能看到）
4. 点击 `Create repository`

### 2. 仓库基本操作

| 操作 | 方法 |
|------|------|
| **查看文件** | 进入仓库，点击文件名查看内容 |
| **创建文件** | 点击 `Add file` → `Create new file` |
| **上传文件** | 点击 `Add file` → `Upload files` |
| **下载文件** | 点击绿色 `Code` 按钮 → `Download ZIP` |
| **删除文件** | 点击文件 → 右上角垃圾桶图标 |
| **创建文件夹** | 创建文件时输入 `文件夹名/文件名` |
| **重命名文件** | 点击文件 → 右上角铅笔图标 → 修改名称 → 提交 |

### 3. 仓库设置

进入仓库 → `Settings` 标签页：

- **改仓库名**：`Repository name` → 修改 → `Rename`
- **删除仓库**：`Danger Zone` → `Delete this repository`
- **切换分支**：`Default branch` → 修改默认分支
- **添加协作者**：`Collaborators` → `Add people`

### 4. 分支管理

**在网页上创建分支：**
1. 点击分支名称（通常显示 `main`）
2. 输入新分支名称
3. 点击 `Create branch: xxx`

**切换分支：**
- 点击分支名称 → 选择要查看的分支

### 5. 提交历史查看

- 点击 `commits`（或代码提交数）
- 查看每次提交的详情
- 点击某次提交 → 查看具体改了哪些文件

### 6. Issue（问题追踪）

1. 点击 `Issues` 标签
2. `New issue` → 输入标题和描述
3. 用于记录 bug、功能需求、任务等

### 7. Pull Request（合并请求）

用于合并代码（多人协作时常用）：
1. 创建新分支 → 修改代码 → push
2. 点击 `Pull requests` → `New pull request`
3. 选择要合并的分支
4. 添加描述 → `Create pull request`

### 8. Fork（复制仓库）

1. 进入别人的仓库
2. 点击右上角 `Fork`
3. 会复制一份到你的账号下
4. 修改后可以提 Pull Request 回原仓库

### 9. 设置 README

仓库根目录创建 `README.md` 文件，内容会显示在仓库首页，说明项目用途。

### 10. 添加 LICENSE（许可证）

在仓库中添加 `LICENSE` 文件，声明别人如何使用你的代码。常用：
- **MIT**：宽松，别人可以随便用
- **Apache 2.0**：宽松，但有专利保护
- **GPL**：别人修改后也必须开源

---

## 九、学习资源

- **官方文档**：https://git-scm.com/doc
- **GitHub 学习**：https://docs.github.com
- **练习 Git**：https://learngitbranching.js.org
- **GitHub 快速入门**：https://docs.github.com/en/get-started
