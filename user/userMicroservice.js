const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const mongoose = require('mongoose');
const User = require('./user');
const sendMessage = require('../kafka/kafkaProducer');

const PROTO_PATH = __dirname + '/user.proto';

// Load the protocol buffer definitions
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const userProto = grpc.loadPackageDefinition(packageDefinition).user;

// Connect to MongoDB database
mongoose.connect('mongodb://localhost:27017/travelBooking', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Create a gRPC server
const server = new grpc.Server();

// Add service definitions to the server
server.addService(userProto.UserService.service, {
  // Method to create a user
  CreateUser: async (call, callback) => {
    try {
      const newUser = new User(call.request);
      const user = await newUser.save();
      await sendMessage('user-events', `User created: ${user.name}`);
      callback(null, { id: user.id, name: user.name, email: user.email });
    } catch (err) {
      callback(err);
    }
  },
  // Method to get a user by ID
  GetUser: async (call, callback) => {
    try {
      const user = await User.findById(call.request.id);
      if (!user) return callback(new Error('User not found'));
      callback(null, { id: user.id, name: user.name, email: user.email });
    } catch (err) {
      callback(err);
    }
  },
  // Method to update a user
  UpdateUser: async (call, callback) => {
    try {
      const user = await User.findByIdAndUpdate(call.request.id, call.request, { new: true });
      if (!user) return callback(new Error('User not found'));
      await sendMessage('user-events', `User updated: ${user.name}`);
      callback(null, { id: user.id, name: user.name, email: user.email });
    } catch (err) {
      callback(err);
    }
  },
  // Method to delete a user
  DeleteUser: async (call, callback) => {
    try {
      const user = await User.findByIdAndDelete(call.request.id);
      if (!user) return callback(new Error('User not found'));
      await sendMessage('user-events', `User deleted: ${user.name}`);
      callback(null, { id: user.id, name: user.name, email: user.email });
    } catch (err) {
      callback(err);
    }
  },
});

// Bind the server to the specified address and start it
server.bindAsync('localhost:50051', grpc.ServerCredentials.createInsecure(), () => {
  console.log('User gRPC server running on port 50051');
  server.start();
});
