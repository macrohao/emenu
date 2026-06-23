const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const categoryRoutes = require('./routes/categories');
const dishRoutes = require('./routes/dishes');
const userRoutes = require('./routes/users');
const { auth } = require('./middleware/auth');

const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 健康检查（公开）
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// 用户路由（含登录，公开）
app.use('/api/users', userRoutes);

// 菜单展示：GET 请求公开，其余需要登录
app.use('/api/categories', (req, res, next) => {
  if (req.method === 'GET') return next();
  return auth(req, res, next);
}, categoryRoutes);

app.use('/api/dishes', (req, res, next) => {
  if (req.method === 'GET') return next();
  return auth(req, res, next);
}, dishRoutes);

// 连接数据库并启动服务
mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB connected successfully');

    // Auto-create default admin on first launch
    const User = require('./models/User');
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      await User.create({
        username: 'admin',
        password: 'admin123',
        nickname: 'Super Admin',
        role: 'admin',
      });
      console.log('Default admin created: admin / admin123 (please change password after login!)');
    }

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log('Server running at http://localhost:' + PORT));
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
