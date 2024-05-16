const mongoose = require('mongoose');

// Creating the user schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
});

module.exports = mongoose.model('User', UserSchema);
