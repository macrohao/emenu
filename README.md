# 🍽️ 电子菜单系统（MERN Stack）

基于 **MongoDB + Express + React + Node.js** 构建的全栈电子菜单管理系统。

## 功能特性

| 模块 | 功能 |
|------|------|
| 📋 电子菜单 | 按分类浏览菜品、搜索菜品、卡片式展示 |
| 🥘 菜品管理 | 增删改查、图片上传（≤5MB）、上下架、排序 |
| 🏷️ 分类管理 | 增删改查、排序、删除前校验是否有关联菜品 |

## 技术栈

- **前端**: React 19 + Ant Design 6 + React Router 6 + Axios
- **后端**: Node.js + Express 4 + Multer（图片上传）
- **数据库**: MongoDB（Mongoose ODM）

## 目录结构

```
emenu/
├── server/             # Express 后端
│   ├── models/         # Mongoose 数据模型
│   │   ├── Category.js
│   │   └── Dish.js
│   ├── routes/         # API 路由
│   │   ├── categories.js
│   │   └── dishes.js
│   ├── uploads/        # 上传的图片（自动创建）
│   ├── index.js        # 入口文件
│   └── .env            # 环境变量
└── client/             # React 前端
    └── src/
        ├── pages/
        │   ├── MenuPage.js       # 电子菜单展示
        │   ├── DishesPage.js     # 菜品管理
        │   └── CategoriesPage.js # 分类管理
        ├── api.js      # Axios 请求封装
        └── App.js      # 路由入口
```

## 快速启动

### 前提条件
- Node.js ≥ 16
- MongoDB 本地运行在 `mongodb://127.0.0.1:27017`

### 1. 安装依赖
```bash
# 安装前后端所有依赖
npm run install:all
```

### 2. 配置环境变量
编辑 `server/.env`：
```
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/emenu
```

### 3. 并发启动（需要先安装 concurrently）
```bash
npm install
npm run dev
```

或分别启动：
```bash
# 终端1 - 启动后端（端口 5000）
cd server && npm run dev

# 终端2 - 启动前端（端口 3000）
cd client && npm start
```

### 4. 访问
- 🌐 电子菜单：http://localhost:3000
- 🔧 后端 API：http://localhost:5000/api

## API 接口

### 分类 `/api/categories`
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/categories` | 获取所有分类 |
| POST | `/api/categories` | 创建分类 |
| PUT | `/api/categories/:id` | 更新分类 |
| DELETE | `/api/categories/:id` | 删除分类（有菜品时拒绝）|

### 菜品 `/api/dishes`
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/dishes` | 获取菜品列表（支持 `?category=id&available=true`）|
| GET | `/api/dishes/:id` | 获取单个菜品 |
| POST | `/api/dishes` | 创建菜品（multipart/form-data）|
| PUT | `/api/dishes/:id` | 更新菜品（multipart/form-data）|
| DELETE | `/api/dishes/:id` | 删除菜品（同时删除图片）|
