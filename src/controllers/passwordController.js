const Password = require('../models/Password');
const { encrypt, decrypt } = require('../utils/crypto');

exports.createPassword = async (req, res) => {
  try {
    const { title, username, password, url, notes, category } = req.body;
    const userId = req.userId;

    const encryptedPassword = encrypt(password, req.masterPassword);

    const newPassword = new Password({
      userId,
      title,
      username,
      encryptedPassword,
      url,
      notes,
      category
    });

    await newPassword.save();

    res.status(201).json({
      message: 'Password saved successfully',
      passwordId: newPassword._id
    });
  } catch (error) {
    res.status(500).json({ message: 'Error saving password', error: error.message });
  }
};

exports.getPasswords = async (req, res) => {
  try {
    const passwords = await Password.find({ userId: req.userId });
    res.json(passwords);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching passwords', error: error.message });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.password) {
      updates.encryptedPassword = encrypt(updates.password, req.masterPassword);
      delete updates.password;
    }

    updates.updatedAt = Date.now();

    const password = await Password.findOneAndUpdate(
      { _id: id, userId: req.userId },
      updates,
      { new: true }
    );

    if (!password) {
      return res.status(404).json({ message: 'Password not found' });
    }

    res.json({ message: 'Password updated successfully', password });
  } catch (error) {
    res.status(500).json({ message: 'Error updating password', error: error.message });
  }
};

exports.deletePassword = async (req, res) => {
  try {
    const { id } = req.params;

    const password = await Password.findOneAndDelete({
      _id: id,
      userId: req.userId
    });

    if (!password) {
      return res.status(404).json({ message: 'Password not found' });
    }

    res.json({ message: 'Password deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting password', error: error.message });
  }
};
