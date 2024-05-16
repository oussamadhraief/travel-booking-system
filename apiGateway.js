const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { ApolloServer } = require('apollo-server-express');
const connectDB = require('./database');
const resolvers = require('./graphql/resolvers');
const typeDefs = require('./graphql/schema');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const sendMessage = require('./kafka/kafkaProducer');

const app = express();
connectDB(); // Connect to the database

app.use(cors()); 
app.use(bodyParser.json()); 

// Load Protos
const userProtoPath = __dirname + '/user/user.proto';
const flightProtoPath = __dirname + '/flight/flight.proto';
const hotelProtoPath = __dirname + '/hotel/hotel.proto';
const bookingProtoPath = __dirname + '/booking/booking.proto';

// Load gRPC package definitions
const userPackageDefinition = protoLoader.loadSync(userProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const flightPackageDefinition = protoLoader.loadSync(flightProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const hotelPackageDefinition = protoLoader.loadSync(hotelProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const bookingPackageDefinition = protoLoader.loadSync(bookingProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

// Load gRPC objects
const userProto = grpc.loadPackageDefinition(userPackageDefinition).user;
const flightProto = grpc.loadPackageDefinition(flightPackageDefinition).flight;
const hotelProto = grpc.loadPackageDefinition(hotelPackageDefinition).hotel;
const bookingProto = grpc.loadPackageDefinition(bookingPackageDefinition).booking;

// Create gRPC clients
const userClient = new userProto.UserService('localhost:50051', grpc.credentials.createInsecure());
const flightClient = new flightProto.FlightService('localhost:50052', grpc.credentials.createInsecure());
const hotelClient = new hotelProto.HotelService('localhost:50053', grpc.credentials.createInsecure());
const bookingClient = new bookingProto.BookingService('localhost:50054', grpc.credentials.createInsecure());

// REST Endpoints for User
app.post('/user', (req, res) => {
  userClient.CreateUser(req.body, async (error, response) => {
    if (error) {
      res.status(500).send(error.message);
    } else {
      await sendMessage('user-events', `User created: ${response.name}`);
      res.send(response);
    }
  });
});

// Get sinle user using id
app.get('/user/:id', (req, res) => {
  userClient.GetUser({ id: req.params.id }, (error, response) => {
    if (error) {
      res.status(500).send(error.message);
    } else {
      res.send(response);
    }
  });
});

// Update user
app.put('/user/:id', (req, res) => {
  const updatedUser = { ...req.body, id: req.params.id };
  userClient.UpdateUser(updatedUser, async (error, response) => {
    if (error) {
      res.status(500).send(error.message);
    } else {
      await sendMessage('user-events', `User updated: ${response.name}`);
      res.send(response);
    }
  });
});

// Delete user
app.delete('/user/:id', (req, res) => {
  userClient.DeleteUser({ id: req.params.id }, async (error, response) => {
    if (error) {
      res.status(500).send(error.message);
    } else {
      await sendMessage('user-events', `User deleted: ${response.name}`);
      res.send(response);
    }
  });
});

// GraphQL Endpoint
const server = new ApolloServer({ typeDefs, resolvers });

const startServer = async () => {
  await server.start(); // Start Apollo Server
  server.applyMiddleware({ app, path: '/graphql' }); // Apply middleware for GraphQL

  const port = 4000;
  app.listen(port, () => {
    console.log(`API Gateway running on port ${port}`);
    console.log(`GraphQL endpoint available at http://localhost:${port}${server.graphqlPath}`);
  });
};

startServer(); // Start the server
