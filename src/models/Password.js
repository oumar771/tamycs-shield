const mongoose = require('mongoose');

const passwordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  username: String,
  encryptedPassword: {
    encrypted: String,
    iv: String,
    salt: String,
    authTag: String
  },
  url: String,
  notes: String,
  category: {
    type: String,
    default: 'Other'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Password', passwordSchema);
