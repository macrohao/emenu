const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    nickname: { type: String, default: '' },
    role: { type: String, enum: ['admin', 'staff'], default: 'staff' },
    enabled: { type: Boolean, default: true },
    avatar: { type: String, default: '' },
  },
  { timestamps: true }
);

// 保存前自动加密密码
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// 校验密码
userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('User', userSchema);
