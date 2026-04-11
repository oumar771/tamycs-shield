const Password = require('../models/Password');
const { encrypt, decrypt } = require('../utils/crypto');

exports.createPassword = async (req, res) => {
  try {
    const { name, title, username, password, url, notes, category } = req.body;
    const userId = req.userId;

    // Use the encryption key to encrypt the password
    const encryptionKey = process.env.ENCRYPTION_KEY || 'default-key-for-development-only';
    const encryptedPassword = encrypt(password, encryptionKey);

    const newPassword = new Password({
      userId,
      title: name || title, // Accept 'name' or 'title'
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

    // Decrypt passwords and return with the 'name' field
    const encryptionKey = process.env.ENCRYPTION_KEY || 'default-key-for-development-only';
    const decryptedPasswords = passwords.map(pwd => {
      const decryptedPassword = decrypt(pwd.encryptedPassword, encryptionKey);
      return {
        _id: pwd._id,
        name: pwd.title, // Map 'title' to 'name' for the frontend
        title: pwd.title,
        username: pwd.username,
        password: decryptedPassword,
        url: pwd.url,
        notes: pwd.notes,
        category: pwd.category,
        createdAt: pwd.createdAt,
        updatedAt: pwd.updatedAt
      };
    });

    res.json(decryptedPasswords);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching passwords', error: error.message });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const encryptionKey = process.env.ENCRYPTION_KEY || 'default-key-for-development-only';

    // Handle the 'name' field and map it to 'title'
    if (updates.name) {
      updates.title = updates.name;
      delete updates.name;
    }

    if (updates.password) {
      updates.encryptedPassword = encrypt(updates.password, encryptionKey);
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
