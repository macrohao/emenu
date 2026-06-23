const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const { auth, adminOnly } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads');
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${req.user.id}-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// multer 错误处理中间件
function handleMulterError(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: '图片大小不能超过 5MB' });
    }
    return res.status(400).json({ message: err.message });
  }
  if (err) return res.status(400).json({ message: err.message });
  next();
}

// ── 登录 ─────────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: '用户名和密码不能为空' });

    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: '用户名或密码错误' });
    if (!user.enabled) return res.status(403).json({ message: '账号已被禁用，请联系管理员' });

    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ message: '用户名或密码错误' });

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role, nickname: user.nickname },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      token,
      user: {
        id: user._id, username: user.username,
        nickname: user.nickname || user.username,
        role: user.role, avatar: user.avatar,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── 获取当前用户信息 ───────────────────────────────────────────────────────────
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: '用户不存在' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── 修改自己的密码 ─────────────────────────────────────────────────────────────
router.put('/me/password', auth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword)
      return res.status(400).json({ message: '请填写原密码和新密码' });
    if (newPassword.length < 6)
      return res.status(400).json({ message: '新密码不能少于6位' });

    const user = await User.findById(req.user.id);
    const match = await user.comparePassword(oldPassword);
    if (!match) return res.status(400).json({ message: '原密码错误' });

    user.password = newPassword;
    await user.save();
    res.json({ message: '密码修改成功' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── 修改个人信息（支持头像上传） ──────────────────────────────────────────────
router.put('/me/profile', auth, upload.single('avatar'), handleMulterError, async (req, res) => {
  try {
    const { nickname, username } = req.body;
    const updateData = {};

    if (nickname !== undefined) updateData.nickname = nickname || '';
    if (username !== undefined) {
      if (username.length < 2) return res.status(400).json({ message: '用户名不能少于2位' });

      // 获取当前用户，只有用户名真的变了才查重
      const currentUser = await User.findById(req.user.id).select('username');
      if (currentUser && username !== currentUser.username) {
        const exists = await User.findOne({ username, _id: { $ne: req.user.id } });
        if (exists) return res.status(400).json({ message: '用户名已被占用' });
      }
      updateData.username = username;
    }
    if (req.file) updateData.avatar = `/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: '用户不存在' });

    // 昵称为空时默认用用户名
    const safeUser = user.toObject();
    if (!safeUser.nickname) safeUser.nickname = safeUser.username;

    res.json(safeUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── 以下接口仅管理员可用 ───────────────────────────────────────────────────────

// 获取所有用户
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 创建用户
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const { username, password, nickname, role } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: '用户名和密码不能为空' });
    if (password.length < 6)
      return res.status(400).json({ message: '密码不能少于6位' });

    const exists = await User.findOne({ username });
    if (exists) return res.status(400).json({ message: '用户名已存在' });

    const user = new User({ username, password, nickname, role });
    await user.save();
    const result = user.toObject();
    delete result.password;
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 更新用户（管理员）
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const { nickname, role, enabled, password } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: '用户不存在' });

    if (nickname !== undefined) user.nickname = nickname;
    if (role !== undefined) user.role = role;
    if (enabled !== undefined) user.enabled = enabled;
    if (password) {
      if (password.length < 6) return res.status(400).json({ message: '密码不能少于6位' });
      user.password = password;
    }
    await user.save();
    const result = user.toObject();
    delete result.password;
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 删除用户
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    if (req.params.id === req.user.id)
      return res.status(400).json({ message: '不能删除自己' });
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: '用户不存在' });
    res.json({ message: '删除成功' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

