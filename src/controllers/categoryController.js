const Category = require('../models/Category');
const Password = require('../models/Password');

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({
      $or: [{ userId: req.userId }, { isDefault: true }]
    });

    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await Password.countDocuments({
          userId: req.userId,
          category: cat.name
        });

        return {
          ...cat.toObject(),
          passwordCount: count
        };
      })
    );

    res.json(categoriesWithCount);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, icon, color } = req.body;

    const category = new Category({
      userId: req.userId,
      name,
      icon,
      color,
      isDefault: false
    });

    await category.save();

    res.status(201).json({
      message: 'Category created',
      category
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating category', error: error.message });
  }
};
