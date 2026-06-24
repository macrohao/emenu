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

const allowedOrigins = [
  'http://localhost:3001',
  'https://emenu-alpha.vercel.app',
  'https://emenu-git-main-macrohao.vercel.app',
  'https://macrohao.gitee.io',
  'https://macrohao.gitee.io/emenu',
  'https://macrohao.github.io',
  'https://macrohao.github.io/emenu',
  'https://shizhenhao001.gitee.io',
  'https://shizhenhao001.gitee.io/emenu-client'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/users', userRoutes);

app.use('/api/categories', (req, res, next) => {
  if (req.method === 'GET') return next();
  return auth(req, res, next);
}, categoryRoutes);

app.use('/api/dishes', (req, res, next) => {
  if (req.method === 'GET') return next();
  return auth(req, res, next);
}, dishRoutes);

// Vercel 模式下导出 app
module.exports = app;

// ── 数据库连接（支持 Vercel Serverless 复用连接） ──
let cachedDb = null;
async function connectDB() {
  if (cachedDb && mongoose.connection.readyState === 1) return cachedDb;
  const conn = await mongoose.connect(process.env.MONGODB_URI);
  cachedDb = conn;
  console.log('MongoDB connected successfully');
  return conn;
}

// 非 Vercel 模式（本地运行）才监听端口
if (!process.env.VERCEL) {
  connectDB().then(async () => {
    const User = require('./models/User');
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      await User.create({
        username: 'admin',
        password: 'admin123',
        nickname: 'Super Admin',
        role: 'admin',
      });
      console.log('Default admin created: admin / admin123');
    }
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log('Server running at http://localhost:' + PORT));
  }).catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
}

// Vercel Serverless：每个请求前确保已连接数据库
if (process.env.VERCEL) {
  const handler = app;
  // Wrap to ensure DB is connected
  const serverlessHandler = async (req, res) => {
    await connectDB();
    return handler(req, res);
  };
  module.exports = serverlessHandler;
}
