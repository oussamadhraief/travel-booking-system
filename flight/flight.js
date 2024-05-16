const mongoose = require('mongoose');

// Creating the flight schema
const FlightSchema = new mongoose.Schema({
  flightNumber: { type: String, required: true },
  departure: { type: String, required: true },
  arrival: { type: String, required: true },
  date: { type: String, required: true },
});

module.exports = mongoose.model('Flight', FlightSchema);
