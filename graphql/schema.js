  const { gql } = require('apollo-server-express');

  const typeDefs = gql`
    # Define User type representing user data
    type User {
      id: ID!
      name: String!
      email: String!
    }

    #Define Flight type representing flight data
    type Flight {
      id: ID!
      flightNumber: String!
      departure: String!
      arrival: String!
      date: String!
    }

    #Define Hotel type representing hotel data
    type Hotel {
      id: ID!
      name: String!
      location: String!
      availableRooms: Int!
    }

    #Define Booking type representing booking data
    type Booking {
      id: ID!
      user: User!
      flight: Flight!
      hotel: Hotel!
    }

    #Define schema for queries
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

    #Define schema for mutations
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
