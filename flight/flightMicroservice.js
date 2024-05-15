const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const mongoose = require('mongoose');
const Flight = require('./flight');
const sendMessage = require('../kafka/kafkaProducer');

const PROTO_PATH = __dirname + '/flight.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const flightProto = grpc.loadPackageDefinition(packageDefinition).flight;

mongoose.connect('mongodb://localhost:27017/travelBooking', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const server = new grpc.Server();

server.addService(flightProto.FlightService.service, {
  CreateFlight: async (call, callback) => {
    try {
      const newFlight = new Flight(call.request);
      const flight = await newFlight.save();
      await sendMessage('flight-events', `Flight created: ${flight.flightNumber}`);
      callback(null, { id: flight.id, flightNumber: flight.flightNumber, departure: flight.departure, arrival: flight.arrival, date: flight.date });
    } catch (err) {
      callback(err);
    }
  },
  GetFlight: async (call, callback) => {
    try {
      const flight = await Flight.findById(call.request.id);
      if (!flight) return callback(new Error('Flight not found'));
      callback(null, { id: flight.id, flightNumber: flight.flightNumber, departure: flight.departure, arrival: flight.arrival, date: flight.date });
    } catch (err) {
      callback(err);
    }
  },
  UpdateFlight: async (call, callback) => {
    try {
      const flight = await Flight.findByIdAndUpdate(call.request.id, call.request, { new: true });
      if (!flight) return callback(new Error('Flight not found'));
      await sendMessage('flight-events', `Flight updated: ${flight.flightNumber}`);
      callback(null, { id: flight.id, flightNumber: flight.flightNumber, departure: flight.departure, arrival: flight.arrival, date: flight.date });
    } catch (err) {
      callback(err);
    }
  },
  DeleteFlight: async (call, callback) => {
    try {
      const flight = await Flight.findByIdAndDelete(call.request.id);
      if (!flight) return callback(new Error('Flight not found'));
      await sendMessage('flight-events', `Flight deleted: ${flight.flightNumber}`);
      callback(null, { id: flight.id, flightNumber: flight.flightNumber, departure: flight.departure, arrival: flight.arrival, date: flight.date });
    } catch (err) {
      callback(err);
    }
  },
});

server.bindAsync('localhost:50052', grpc.ServerCredentials.createInsecure(), () => {
  console.log('Flight gRPC server running on port 50052');
  server.start();
});
