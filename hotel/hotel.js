const mongoose = require('mongoose');

// Creating the hotel schema
const HotelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  availableRooms: { type: Number, required: true },
});

module.exports = mongoose.model('Hotel', HotelSchema);
