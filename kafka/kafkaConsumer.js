const { Kafka } = require('kafkajs');

// Create a new Kafka instance with the specified configuration
const kafka = new Kafka({
  clientId: 'travel-booking-system',
  brokers: ['localhost:9092']
});

const consumer = kafka.consumer({ groupId: 'travel-booking-group' });

// Function to run the consumer
const run = async () => {
  await consumer.connect();

   // Subscribe to the specified topics and start consuming messages from the beginning
  await consumer.subscribe({ topic: 'user-events', fromBeginning: true });
  await consumer.subscribe({ topic: 'flight-events', fromBeginning: true });
  await consumer.subscribe({ topic: 'hotel-events', fromBeginning: true });
  await consumer.subscribe({ topic: 'booking-events', fromBeginning: true });

  // Start consuming messages
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`;
      console.log(`- ${prefix} ${message.key}#${message.value}`);
    },
  });
};

run().catch(console.error);
