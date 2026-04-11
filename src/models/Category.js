const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  icon: String,
  color: String,
  isDefault: {
    type: Boolean,
    default: false
  }
});

const defaultCategories = [
  { name: 'Social Media', icon: '🌐', color: '#1DA1F2', isDefault: true },
  { name: 'Banking', icon: '🏦', color: '#00897B', isDefault: true },
  { name: 'Email', icon: '📧', color: '#EA4335', isDefault: true },
  { name: 'Shopping', icon: '🛒', color: '#FF6F00', isDefault: true },
  { name: 'Work', icon: '💼', color: '#5E35B1', isDefault: true },
  { name: 'Entertainment', icon: '🎬', color: '#E91E63', isDefault: true },
  { name: 'Health', icon: '⚕️', color: '#43A047', isDefault: true },
  { name: 'Other', icon: '📁', color: '#757575', isDefault: true }
];

module.exports = mongoose.model('Category', categorySchema);
module.exports.defaultCategories = defaultCategories;
