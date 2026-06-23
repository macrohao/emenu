const jwt = require('jsonwebtoken');

// 验证 Token
const auth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: '未登录，请先登录' });
  }
  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // 确保 user 对象有 _id 字段，与数据库 Schema 对应
    req.user = {
      id: decoded.id,
      _id: decoded.id,
      username: decoded.username,
      role: decoded.role,
      nickname: decoded.nickname,
    };
    next();
  } catch {
    return res.status(401).json({ message: 'Token 无效或已过期，请重新登录' });
  }
};

// 仅管理员可访问
const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: '权限不足，需要管理员身份' });
  }
  next();
};

module.exports = { auth, adminOnly };

