const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
  }

  type Flight {
    id: ID!
    flightNumber: String!
    departure: String!
    arrival: String!
    date: String!
  }

  type Hotel {
    id: ID!
    name: String!
    location: String!
    availableRooms: Int!
  }

  type Booking {
    id: ID!
    user: User!
    flight: Flight!
    hotel: Hotel!
  }

  type Query {
    users: [User]
    user(id: ID!): User
    flights: [Flight]
    flight(id: ID!): Flight
    hotels: [Hotel]
    hotel(id: ID!): Hotel
    bookings: [Booking]
    booking(id: ID!): Booking
  }

  type Mutation {
    createUser(name: String!, email: String!): User
    updateUser(id: ID!, name: String!, email: String!): User
    deleteUser(id: ID!): String
    createFlight(flightNumber: String!, departure: String!, arrival: String!, date: String!): Flight
    updateFlight(id: ID!, flightNumber: String!, departure: String!, arrival: String!, date: String!): Flight
    deleteFlight(id: ID!): String
    createHotel(name: String!, location: String!, availableRooms: Int!): Hotel
    updateHotel(id: ID!, name: String!, location: String!, availableRooms: Int!): Hotel
    deleteHotel(id: ID!): String
    createBooking(userId: ID!, flightId: ID!, hotelId: ID!): Booking
    updateBooking(id: ID!, userId: ID!, flightId: ID!, hotelId: ID!): Booking
    deleteBooking(id: ID!): String
  }
`;

module.exports = typeDefs;
