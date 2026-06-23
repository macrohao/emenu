const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Category = require('./models/Category');
const Dish = require('./models/Dish');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to database');

  // 1. Create benben user
  let benben = await User.findOne({ username: 'benben' });
  if (!benben) {
    benben = await User.create({
      username: 'benben',
      password: 'benben123',
      nickname: 'BenBen',
      role: 'staff',
    });
    console.log('Created user: benben (password: benben123)');
  } else {
    console.log('User benben already exists');
  }

  // 2. Create admin user
  let admin = await User.findOne({ username: 'admin' });
  if (!admin) {
    admin = await User.create({
      username: 'admin',
      password: 'admin123',
      nickname: 'Admin',
      role: 'admin',
    });
    console.log('Created user: admin (password: admin123)');
  } else {
    console.log('User admin already exists');
  }

  // 3. Create categories
  const categoriesData = [
    { name: 'Signature', description: 'Signature dishes', sort: 0 },
    { name: 'Spicy', description: 'Sichuan & Hunan style', sort: 1 },
    { name: 'Cold Dish', description: 'Appetizers & cold dishes', sort: 2 },
    { name: 'Soup', description: 'Soup & stew', sort: 3 },
    { name: 'Staple', description: 'Rice & noodles', sort: 4 },
    { name: 'Drink', description: 'Beverages & desserts', sort: 5 },
  ];

  const categories = {};
  for (const c of categoriesData) {
    let cat = await Category.findOne({ name: c.name });
    if (!cat) {
      cat = await Category.create(c);
      console.log('Created category: ' + c.name);
    } else {
      console.log('Category already exists: ' + c.name);
    }
    categories[c.name] = cat;
  }

  // 4. Create dishes for benben
  const dishesData = [
    { name: 'Braised Pork Belly', description: 'Rich and tender classic braised pork', price: 58, category: 'Signature', sort: 0 },
    { name: 'Boiled Fish in Chili', description: 'Spicy and tender Sichuan fish', price: 68, category: 'Spicy', sort: 0 },
    { name: 'Mapo Tofu', description: 'Spicy and silky tofu', price: 28, category: 'Spicy', sort: 1 },
    { name: 'Cucumber Salad', description: 'Fresh and crispy appetizer', price: 16, category: 'Cold Dish', sort: 0 },
    { name: 'Mouthwatering Chicken', description: 'Spicy chicken in chili oil', price: 32, category: 'Cold Dish', sort: 1 },
    { name: 'Sour Cabbage Fish', description: 'Tangy and tender fish soup', price: 72, category: 'Spicy', sort: 2 },
    { name: 'Tomato Egg Soup', description: 'Classic home-style soup', price: 18, category: 'Soup', sort: 0 },
    { name: 'Corn Rib Soup', description: 'Sweet and nourishing soup', price: 38, category: 'Soup', sort: 1 },
    { name: 'Egg Fried Rice', description: 'Simple and delicious fried rice', price: 22, category: 'Staple', sort: 0 },
    { name: 'Dan Dan Noodles', description: 'Authentic Chengdu spicy noodles', price: 26, category: 'Staple', sort: 1 },
    { name: 'Sour Plum Drink', description: 'Refreshing iced sour plum beverage', price: 12, category: 'Drink', sort: 0 },
    { name: 'Mango Pudding', description: 'Sweet and silky mango dessert', price: 18, category: 'Drink', sort: 1 },
  ];

  let dishCount = 0;
  for (const d of dishesData) {
    const exists = await Dish.findOne({ name: d.name, owner: benben._id });
    if (!exists) {
      await Dish.create({
        name: d.name,
        description: d.description,
        price: d.price,
        category: categories[d.category]._id,
        available: true,
        sort: d.sort,
        owner: benben._id,
      });
      dishCount++;
    }
  }
  console.log('Created ' + dishCount + ' dishes (benben)');
  if (dishCount === 0) console.log('Dishes already exist, skipped');

  // 5. Create dishes for admin
  const adminDishes = [
    { name: 'Buddha Jumping Wall', description: 'Premium seafood stew', price: 288, category: 'Signature', sort: 1 },
    { name: 'Lobster Sashimi', description: 'Fresh and sweet raw lobster', price: 398, category: 'Cold Dish', sort: 2 },
  ];

  let adminDishCount = 0;
  for (const d of adminDishes) {
    const exists = await Dish.findOne({ name: d.name, owner: admin._id });
    if (!exists) {
      await Dish.create({
        name: d.name,
        description: d.description,
        price: d.price,
        category: categories[d.category]._id,
        available: true,
        sort: d.sort,
        owner: admin._id,
      });
      adminDishCount++;
    }
  }
  if (adminDishCount > 0) console.log('Created ' + adminDishCount + ' dishes (admin)');

  console.log('\nSeed data ready!');
  console.log('Login accounts:');
  console.log('  Staff: benben / benben123');
  console.log('  Admin: admin / admin123');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
