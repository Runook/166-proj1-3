# ⚡ GCP 快速部署指南

## 🚀 一键部署到 Cloud Run

### 前置要求

1. **安装 Google Cloud SDK**
   ```bash
   # macOS
   brew install --cask google-cloud-sdk
   
   # 或访问: https://cloud.google.com/sdk/docs/install
   ```

2. **安装 Docker Desktop**
   - 下载: https://www.docker.com/products/docker-desktop

3. **登录 GCP**
   ```bash
   gcloud auth login
   gcloud init
   ```

### 快速部署

```bash
# 1. 设置你的项目ID
export PROJECT_ID=your-gcp-project-id

# 2. 运行部署脚本
./deploy-cloud-run.sh $PROJECT_ID us-central1
```

就是这么简单！🎉

---

## 📋 完整步骤

### 步骤1：准备环境

```bash
# 登录 GCP
gcloud auth login

# 创建或选择项目
gcloud projects create your-project-id
# 或
gcloud config set project existing-project-id
```

### 步骤2：启用必要的 API

```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### 步骤3：部署

```bash
# 使用部署脚本（推荐）
./deploy-cloud-run.sh YOUR_PROJECT_ID us-central1

# 或使用 npm 命令
npm run deploy YOUR_PROJECT_ID
```

### 步骤4：访问应用

部署完成后，脚本会显示服务 URL，例如：
```
https://graduate-location-map-xxxxx-uc.a.run.app
```

打开这个 URL 即可使用！

---

## 🔧 手动部署（如果脚本失败）

```bash
# 1. 设置变量
export PROJECT_ID=your-project-id
export SERVICE_NAME=graduate-location-map
export IMAGE_NAME=gcr.io/${PROJECT_ID}/${SERVICE_NAME}

# 2. 构建镜像
docker build -t ${IMAGE_NAME} .

# 3. 推送镜像
docker push ${IMAGE_NAME}

# 4. 部署到 Cloud Run
gcloud run deploy ${SERVICE_NAME} \
  --image ${IMAGE_NAME} \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars DB_USER=jc6292,DB_HOST=34.139.8.30,DB_NAME=proj1part2,DB_PASSWORD=854037,DB_PORT=5432,NODE_ENV=production \
  --memory 512Mi \
  --cpu 1
```

---

## ✅ 验证部署

部署成功后：

1. **检查服务状态**
   ```bash
   gcloud run services describe graduate-location-map --region us-central1
   ```

2. **查看日志**
   ```bash
   gcloud run services logs read graduate-location-map --region us-central1
   ```

3. **访问应用**
   - 在浏览器中打开服务 URL
   - 应该看到登录页面

---

## 🔄 更新部署

修改代码后，重新部署：

```bash
./deploy-cloud-run.sh YOUR_PROJECT_ID us-central1
```

---

## 🐛 常见问题

### 问题1：Docker build 失败

**解决：**
```bash
# 确保 Docker 正在运行
docker ps

# 测试构建
docker build -t test .
```

### 问题2：权限错误

**解决：**
```bash
# 授予必要的权限
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="user:$(gcloud config get-value account)" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="user:$(gcloud config get-value account)" \
  --role="roles/storage.admin"
```

### 问题3：数据库连接失败

**检查：**
- 数据库服务器是否允许 GCP IP 访问
- 防火墙规则是否配置正确
- 环境变量是否正确设置

---

## 📚 更多信息

查看完整文档：`GCP_DEPLOYMENT.md`

---

**祝你部署顺利！** 🚀

