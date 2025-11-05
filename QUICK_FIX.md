# ⚡ 快速修复指南

## 🚨 如果功能用不了，按顺序执行：

### 1️⃣ 检查并创建 .env 文件

```bash
# 检查是否存在
ls -la .env

# 如果不存在，创建它
cat > .env << 'EOF'
DB_USER=jc6292
DB_HOST=34.139.8.30
DB_NAME=proj1part2
DB_PASSWORD=854037
DB_PORT=5432
PORT=3001
EOF
```

### 2️⃣ 测试数据库连接

```bash
node test-db-connection.js
```

**应该看到：** ✅ All tests passed!

### 3️⃣ 清理端口并重启

```bash
./clear-ports.sh
./start.sh
```

### 4️⃣ 访问应用

打开浏览器：http://localhost:3000

---

## ✅ 验证系统正常

### 快速测试

```bash
# 测试API
curl http://localhost:3001/api/clubs

# 应该返回JSON数据
```

### 浏览器测试

1. 打开 http://localhost:3000
2. 按 F12 打开开发者工具
3. 查看 Console - 应该没有红色错误
4. 查看 Network - API请求应该成功（状态200）

---

## 🔍 如果还是不行

### 检查后端日志

在运行 `./start.sh` 的终端中，应该看到：
```
Database connected successfully
Server running on port 3001
```

如果没有看到这些，说明有问题。

### 检查浏览器错误

1. 打开 http://localhost:3000
2. 按 F12
3. 查看 Console 标签
4. 截图或复制错误信息

---

## 📞 常见错误

### 错误：Cannot find module 'dotenv'
```bash
npm install
```

### 错误：Port already in use
```bash
./clear-ports.sh
```

### 错误：Database connection error
- 检查 .env 文件是否存在
- 运行 `node test-db-connection.js`

### 错误：CORS error
- 确认后端在运行
- 检查端口3001是否可访问

---

## 🎯 一键修复

```bash
# 完整修复流程
cat > .env << 'EOF'
DB_USER=jc6292
DB_HOST=34.139.8.30
DB_NAME=proj1part2
DB_PASSWORD=854037
DB_PORT=5432
PORT=3001
EOF

./clear-ports.sh
./start.sh
```

然后访问：http://localhost:3000

