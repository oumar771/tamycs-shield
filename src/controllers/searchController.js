const Password = require('../models/Password');

exports.searchPasswords = async (req, res) => {
  try {
    const { query, category } = req.query;
    const userId = req.userId;

    let filter = { userId };

    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { username: { $regex: query, $options: 'i' } },
        { url: { $regex: query, $options: 'i' } }
      ];
    }

    if (category && category !== 'all') {
      filter.category = category;
    }

    const passwords = await Password.find(filter).sort({ updatedAt: -1 });

    res.json({
      count: passwords.length,
      passwords
    });
  } catch (error) {
    res.status(500).json({ message: 'Search error', error: error.message });
  }
};
