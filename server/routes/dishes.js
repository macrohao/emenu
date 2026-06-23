const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Dish = require('../models/Dish');
const { auth } = require('../middleware/auth');

// ── Multer 配置 ──────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `dish_${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  if (allowed.test(path.extname(file.originalname).toLowerCase())) {
    cb(null, true);
  } else {
    cb(new Error('只允许上传图片文件 (jpeg/jpg/png/gif/webp)'));
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// ── 路由 ─────────────────────────────────────────────────────────────────────

// 获取所有菜品（支持按分类、用户筛选）
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.available !== undefined) filter.available = req.query.available === 'true';
    if (req.query.owner) filter.owner = req.query.owner;
    
    const dishes = await Dish.find(filter)
      .populate('category', 'name')
      .populate('owner', 'username nickname')
      .sort({ sort: 1, createdAt: 1 });
    res.json(dishes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 获取当前用户的菜品
router.get('/my', auth, async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: '未登录' });
    
    const filter = { owner: req.user._id };
    if (req.query.available !== undefined) filter.available = req.query.available === 'true';
    
    const dishes = await Dish.find(filter)
      .populate('category', 'name')
      .populate('owner', 'username nickname')
      .sort({ sort: 1, createdAt: 1 });
    res.json(dishes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 获取单个菜品
router.get('/:id', async (req, res) => {
  try {
    const dish = await Dish.findById(req.params.id)
      .populate('category', 'name')
      .populate('owner', 'username nickname');
    if (!dish) return res.status(404).json({ message: '菜品不存在' });
    res.json(dish);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 创建菜品（含图片上传）
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: '未登录' });
    
    const data = { ...req.body };
    data.owner = req.user._id;
    if (req.file) data.image = `/uploads/${req.file.filename}`;
    const dish = new Dish(data);
    const saved = await dish.save();
    const populated = await saved.populate('category', 'name').populate('owner', 'username nickname');
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 更新菜品（含图片更新）
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: '未登录' });
    
    const dish = await Dish.findById(req.params.id);
    if (!dish) return res.status(404).json({ message: '菜品不存在' });
    
    // 验证权限：只有创建者或管理员可以修改
    if (dish.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: '无权修改此菜品' });
    }
    
    const data = { ...req.body };
    if (req.file) {
      // 删除旧图片
      if (dish.image) {
        const oldPath = path.join(__dirname, '..', dish.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      data.image = `/uploads/${req.file.filename}`;
    }
    const updated = await Dish.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true })
      .populate('category', 'name')
      .populate('owner', 'username nickname');
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 删除菜品
router.delete('/:id', async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: '未登录' });
    
    const dish = await Dish.findById(req.params.id);
    if (!dish) return res.status(404).json({ message: '菜品不存在' });
    
    // 验证权限：只有创建者或管理员可以删除
    if (dish.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: '无权删除此菜品' });
    }
    
    if (dish.image) {
      const imgPath = path.join(__dirname, '..', dish.image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }
    await Dish.findByIdAndDelete(req.params.id);
    res.json({ message: '删除成功' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 图片上传单独接口
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: '未上传文件' });
  res.json({ url: `/uploads/${req.file.filename}` });
});

module.exports = router;
