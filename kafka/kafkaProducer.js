const { Kafka } = require('kafkajs');

// Create a new Kafka instance with the specified configuration
const kafka = new Kafka({
  clientId: 'travel-booking-system',
  brokers: ['localhost:9092'],
});

const producer = kafka.producer();

// Function to send a message to a Kafka topic
const sendMessage = async (topic, message) => {
  await producer.connect();

  // Send the message to the specified topic
  await producer.send({
    topic,
    messages: [{ value: message }],
  });

  // Disconnect from the Kafka broker
  await producer.disconnect();
};

module.exports = sendMessage;
