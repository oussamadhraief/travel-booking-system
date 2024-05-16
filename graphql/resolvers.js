const { ApolloError } = require('apollo-server-express');
const User = require('../user/user');
const Flight = require('../flight/flight');
const Hotel = require('../hotel/hotel');
const Booking = require('../booking/booking');
const sendMessage = require('../kafka/kafkaProducer');

// Resolver functions for handling queries and mutations
const resolvers = {
  Query: {
    users: async () => {
      try {
        return await User.find();
      } catch (error) {
        throw new ApolloError(`Error finding users: ${error.message}`, "INTERNAL_ERROR");
      }
    },
    user: async (_, { id }) => {
      try {
        return await User.findById(id);
      } catch (error) {
        throw new ApolloError(`Error finding user: ${error.message}`, "INTERNAL_ERROR");
      }
    },
    flights: async () => {
      try {
        return await Flight.find();
      } catch (error) {
        throw new ApolloError(`Error finding flights: ${error.message}`, "INTERNAL_ERROR");
      }
    },
    flight: async (_, { id }) => {
      try {
        return await Flight.findById(id);
      } catch (error) {
        throw new ApolloError(`Error finding flight: ${error.message}`, "INTERNAL_ERROR");
      }
    },
    hotels: async () => {
      try {
        return await Hotel.find();
      } catch (error) {
        throw new ApolloError(`Error finding hotels: ${error.message}`, "INTERNAL_ERROR");
      }
    },
    hotel: async (_, { id }) => {
      try {
        return await Hotel.findById(id);
      } catch (error) {
        throw new ApolloError(`Error finding hotel: ${error.message}`, "INTERNAL_ERROR");
      }
    },
    bookings: async () => {
      try {
        return await Booking.find().populate('userId flightId hotelId');
      } catch (error) {
        throw new ApolloError(`Error finding bookings: ${error.message}`, "INTERNAL_ERROR");
      }
    },
    booking: async (_, { id }) => {
      try {
        return await Booking.findById(id).populate('userId flightId hotelId');
      } catch (error) {
        throw new ApolloError(`Error finding booking: ${error.message}`, "INTERNAL_ERROR");
      }
    },
  },
  Mutation: {
    createUser: async (_, { name, email }) => {
      try {
        const newUser = new User({ name, email });
        const user = await newUser.save();
        await sendMessage('user-events', `User created: ${user.name}`);
        return user;
      } catch (error) {
        throw new ApolloError(`Error creating user: ${error.message}`, "INTERNAL_ERROR");
      }
    },
    updateUser: async (_, { id, name, email }) => {
      try {
        const user = await User.findByIdAndUpdate(id, { name, email }, { new: true });
        if (!user) {
          throw new ApolloError("User not found", "NOT_FOUND");
        }
        await sendMessage('user-events', `User updated: ${user.name}`);
        return user;
      } catch (error) {
        throw new ApolloError(`Error updating user: ${error.message}`, "INTERNAL_ERROR");
      }
    },
    deleteUser: async (_, { id }) => {
      try {
        const user = await User.findByIdAndDelete(id);
        if (!user) {
          throw new ApolloError("User not found", "NOT_FOUND");
        }
        await sendMessage('user-events', `User deleted: ${user.name}`);
        return "User deleted successfully";
      } catch (error) {
        throw new ApolloError(`Error deleting user: ${error.message}`, "INTERNAL_ERROR");
      }
    },
    createFlight: async (_, { flightNumber, departure, arrival, date }) => {
      try {
        const newFlight = new Flight({ flightNumber, departure, arrival, date });
        const flight = await newFlight.save();
        await sendMessage('flight-events', `Flight created: ${flight.flightNumber}`);
        return flight;
      } catch (error) {
        throw new ApolloError(`Error creating flight: ${error.message}`, "INTERNAL_ERROR");
      }
    },
    updateFlight: async (_, { id, flightNumber, departure, arrival, date }) => {
      try {
        const flight = await Flight.findByIdAndUpdate(id, { flightNumber, departure, arrival, date }, { new: true });
        if (!flight) {
          throw new ApolloError("Flight not found", "NOT_FOUND");
        }
        await sendMessage('flight-events', `Flight updated: ${flight.flightNumber}`);
        return flight;
      } catch (error) {
        throw new ApolloError(`Error updating flight: ${error.message}`, "INTERNAL_ERROR");
      }
    },
    deleteFlight: async (_, { id }) => {
      try {
        const flight = await Flight.findByIdAndDelete(id);
        if (!flight) {
          throw new ApolloError("Flight not found", "NOT_FOUND");
        }
        await sendMessage('flight-events', `Flight deleted: ${flight.flightNumber}`);
        return "Flight deleted successfully";
      } catch (error) {
        throw new ApolloError(`Error deleting flight: ${error.message}`, "INTERNAL_ERROR");
      }
    },
    createHotel: async (_, { name, location, availableRooms }) => {
      try {
        const newHotel = new Hotel({ name, location, availableRooms });
        const hotel = await newHotel.save();
        await sendMessage('hotel-events', `Hotel created: ${hotel.name}`);
        return hotel;
      } catch (error) {
        throw new ApolloError(`Error creating hotel: ${error.message}`, "INTERNAL_ERROR");
      }
    },
    updateHotel: async (_, { id, name, location, availableRooms }) => {
      try {
        const hotel = await Hotel.findByIdAndUpdate(id, { name, location, availableRooms }, { new: true });
        if (!hotel) {
          throw new ApolloError("Hotel not found", "NOT_FOUND");
        }
        await sendMessage('hotel-events', `Hotel updated: ${hotel.name}`);
        return hotel;
      } catch (error) {
        throw new ApolloError(`Error updating hotel: ${error.message}`, "INTERNAL_ERROR");
      }
    },
    deleteHotel: async (_, { id }) => {
      try {
        const hotel = await Hotel.findByIdAndDelete(id);
        if (!hotel) {
          throw new ApolloError("Hotel not found", "NOT_FOUND");
        }
        await sendMessage('hotel-events', `Hotel deleted: ${hotel.name}`);
        return "Hotel deleted successfully";
      } catch (error) {
        throw new ApolloError(`Error deleting hotel: ${error.message}`, "INTERNAL_ERROR");
      }
    },
    createBooking: async (_, { userId, flightId, hotelId }) => {
      try {
        const newBooking = new Booking({ userId, flightId, hotelId });
        const booking = await newBooking.save();
        await sendMessage('booking-events', `Booking created for user: ${booking.userId}`);
        return booking;
      } catch (error) {
        throw new ApolloError(`Error creating booking: ${error.message}`, "INTERNAL_ERROR");
      }
    },
    updateBooking: async (_, { id, userId, flightId, hotelId }) => {
      try {
        const booking = await Booking.findByIdAndUpdate(id, { userId, flightId, hotelId }, { new: true });
        if (!booking) {
          throw new ApolloError("Booking not found", "NOT_FOUND");
        }
        await sendMessage('booking-events', `Booking updated for user: ${booking.userId}`);
        return booking;
      } catch (error) {
        throw new ApolloError(`Error updating booking: ${error.message}`, "INTERNAL_ERROR");
      }
    },
    deleteBooking: async (_, { id }) => {
      try {
        const booking = await Booking.findByIdAndDelete(id);
        if (!booking) {
          throw new ApolloError("Booking not found", "NOT_FOUND");
        }
        await sendMessage('booking-events', `Booking deleted for user: ${booking.userId}`);
        return "Booking deleted successfully";
      } catch (error) {
        throw new ApolloError(`Error deleting booking: ${error.message}`, "INTERNAL_ERROR");
      }
    },
  },
  // Resolver functions for the Booking type to resolve nested fields
  Booking: {
    user: async (booking) => {
      return await User.findById(booking.userId);
    },
    flight: async (booking) => {
      return await Flight.findById(booking.flightId);
    },
    hotel: async (booking) => {
      return await Hotel.findById(booking.hotelId);
    },
  },
};

module.exports = resolvers;
