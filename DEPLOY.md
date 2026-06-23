# 电子菜单系统 - 部署指南

## 部署架构

```
┌─────────────────┐         ┌─────────────────┐
│   Vercel        │         │   Render        │
│   (前端)        │ ──────▶ │   (后端 API)    │
│   静态托管      │         │   Node.js       │
└─────────────────┘         └────────┬────────┘
                                       │
                                       ▼
                              ┌─────────────────┐
                              │   MongoDB Atlas │
                              │   (数据库)      │
                              └─────────────────┘
```

## 快速部署

### 方式一：推荐 - 前端 Vercel + 后端 Render

#### 1. 后端部署到 Render

1. 访问 [render.com](https://render.com) 并登录
2. 点击 "New +" → "Blueprint"
3. 连接 GitHub 仓库
4. 选择 `render.yaml` 文件
5. 添加环境变量：
   - `MONGODB_URI`: 你的 MongoDB Atlas 连接字符串
   - `JWT_SECRET`: 自定义密钥
6. 点击 "Create Blueprint"

#### 2. 前端部署到 Vercel

1. 访问 [vercel.com](https://vercel.com) 并登录
2. 点击 "Add New..." → "Project"
3. 导入 `client` 文件夹
4. 添加环境变量：
   - `REACT_APP_API_URL`: 你的 Render 后端地址 (例如: `https://emenu-backend.onrender.com`)
5. Deploy

#### 3. 配置前端 API 地址

修改 `client/src/api.js` 中的 baseURL：

```javascript
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
});
```

### 方式二：全部部署到 Render

1. 将后端部署到 Render（使用 render.yaml）
2. 将前端 build 后的文件放入 `server/public` 目录
3. Render 会自动托管静态文件

### 方式三：Docker 部署（自建服务器）

```bash
docker-compose up -d
```

## 环境变量配置

### 后端 (.env)

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/emenu
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRES_IN=7d
```

### 前端

```env
REACT_APP_API_URL=https://your-backend-url.onrender.com
```

## MongoDB Atlas 配置

1. 创建 [MongoDB Atlas](https://www.mongodb.com/atlas) 免费集群
2. 在 Network Access 中添加 `0.0.0.0/0` 允许所有 IP
3. 创建数据库用户
4. 获取连接字符串

## 默认账号

- 用户名: `admin`
- 密码: `admin123`

⚠️ **首次登录后请修改密码！**

## 常见问题

### CORS 错误

后端已配置 CORS，如仍有问题检查：
1. 后端 `.env` 中的 `ALLOWED_ORIGINS`
2. Render 域名是否在白名单

### 图片上传失败

Render 免费版无持久文件系统，生产环境建议：
1. 使用 Cloudinary
2. 使用 AWS S3
3. 或升级 Render 付费版

### 数据库连接失败

1. 检查 MongoDB Atlas IP 白名单
2. 验证连接字符串格式
3. 检查用户名密码是否正确
