const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const mongoose = require('mongoose');
const Booking = require('./booking');
const sendMessage = require('../kafka/kafkaProducer');

const PROTO_PATH = __dirname + '/booking.proto';

// Load the protocol buffer definitions
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const bookingProto = grpc.loadPackageDefinition(packageDefinition).booking;

// Connect to MongoDB database
mongoose.connect('mongodb://localhost:27017/travelBooking', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Create a gRPC server
const server = new grpc.Server();

// Add service definitions to the server
server.addService(bookingProto.BookingService.service, {
  // Method to create a booking
  CreateBooking: async (call, callback) => {
    try {
      const newBooking = new Booking(call.request);
      const booking = await newBooking.save();
      await sendMessage('booking-events', `Booking created for user: ${booking.userId}`);
      callback(null, { id: booking.id, userId: booking.userId, flightId: booking.flightId, hotelId: booking.hotelId });
    } catch (err) {
      callback(err);
    }
  },
  // Method to get a booking by ID
  GetBooking: async (call, callback) => {
    try {
      const booking = await Booking.findById(call.request.id);
      if (!booking) return callback(new Error('Booking not found'));
      callback(null, { id: booking.id, userId: booking.userId, flightId: booking.flightId, hotelId: booking.hotelId });
    } catch (err) {
      callback(err);
    }
  },
  // Method to update a booking
  UpdateBooking: async (call, callback) => {
    try {
      const booking = await Booking.findByIdAndUpdate(call.request.id, call.request, { new: true });
      if (!booking) return callback(new Error('Booking not found'));
      await sendMessage('booking-events', `Booking updated for user: ${booking.userId}`);
      callback(null, { id: booking.id, userId: booking.userId, flightId: booking.flightId, hotelId: booking.hotelId });
    } catch (err) {
      callback(err);
    }
  },
  // Method to delete a booking
  DeleteBooking: async (call, callback) => {
    try {
      const booking = await Booking.findByIdAndDelete(call.request.id);
      if (!booking) return callback(new Error('Booking not found'));
      await sendMessage('booking-events', `Booking deleted for user: ${booking.userId}`);
      callback(null, { id: booking.id, userId: booking.userId, flightId: booking.flightId, hotelId: booking.hotelId });
    } catch (err) {
      callback(err);
    }
  },
});

// Bind the server to the specified address and start it
server.bindAsync('localhost:50054', grpc.ServerCredentials.createInsecure(), () => {
  console.log('Booking gRPC server running on port 50054');
  server.start();
});
