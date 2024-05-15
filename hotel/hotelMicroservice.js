const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const mongoose = require('mongoose');
const Hotel = require('./hotel');
const sendMessage = require('../kafka/kafkaProducer');

const PROTO_PATH = __dirname + '/hotel.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const hotelProto = grpc.loadPackageDefinition(packageDefinition).hotel;

mongoose.connect('mongodb://localhost:27017/travelBooking', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const server = new grpc.Server();

server.addService(hotelProto.HotelService.service, {
  CreateHotel: async (call, callback) => {
    try {
      const newHotel = new Hotel(call.request);
      const hotel = await newHotel.save();
      await sendMessage('hotel-events', `Hotel created: ${hotel.name}`);
      callback(null, { id: hotel.id, name: hotel.name, location: hotel.location, availableRooms: hotel.availableRooms });
    } catch (err) {
      callback(err);
    }
  },
  GetHotel: async (call, callback) => {
    try {
      const hotel = await Hotel.findById(call.request.id);
      if (!hotel) return callback(new Error('Hotel not found'));
      callback(null, { id: hotel.id, name: hotel.name, location: hotel.location, availableRooms: hotel.availableRooms });
    } catch (err) {
      callback(err);
    }
  },
  UpdateHotel: async (call, callback) => {
    try {
      const hotel = await Hotel.findByIdAndUpdate(call.request.id, call.request, { new: true });
      if (!hotel) return callback(new Error('Hotel not found'));
      await sendMessage('hotel-events', `Hotel updated: ${hotel.name}`);
      callback(null, { id: hotel.id, name: hotel.name, location: hotel.location, availableRooms: hotel.availableRooms });
    } catch (err) {
      callback(err);
    }
  },
  DeleteHotel: async (call, callback) => {
    try {
      const hotel = await Hotel.findByIdAndDelete(call.request.id);
      if (!hotel) return callback(new Error('Hotel not found'));
      await sendMessage('hotel-events', `Hotel deleted: ${hotel.name}`);
      callback(null, { id: hotel.id, name: hotel.name, location: hotel.location, availableRooms: hotel.availableRooms });
    } catch (err) {
      callback(err);
    }
  },
});

server.bindAsync('localhost:50053', grpc.ServerCredentials.createInsecure(), () => {
  console.log('Hotel gRPC server running on port 50053');
  server.start();
});
