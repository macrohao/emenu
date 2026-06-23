const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Dish = require('../models/Dish');

// 获取所有分类
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ sort: 1, createdAt: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 创建分类
router.post('/', async (req, res) => {
  try {
    const category = new Category(req.body);
    const saved = await category.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 更新分类
router.put('/:id', async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) return res.status(404).json({ message: '分类不存在' });
    res.json(category);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 删除分类（同时检查是否有关联菜品）
router.delete('/:id', async (req, res) => {
  try {
    const count = await Dish.countDocuments({ category: req.params.id });
    if (count > 0) {
      return res.status(400).json({ message: `该分类下还有 ${count} 道菜品，请先移除菜品再删除分类` });
    }
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: '分类不存在' });
    res.json({ message: '删除成功' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
