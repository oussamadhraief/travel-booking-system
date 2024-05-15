const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'travel-booking-system',
  brokers: ['localhost:9092']
});

const consumer = kafka.consumer({ groupId: 'travel-booking-group' });

const run = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'user-events', fromBeginning: true });
  await consumer.subscribe({ topic: 'flight-events', fromBeginning: true });
  await consumer.subscribe({ topic: 'hotel-events', fromBeginning: true });
  await consumer.subscribe({ topic: 'booking-events', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`;
      console.log(`- ${prefix} ${message.key}#${message.value}`);
    },
  });
};

run().catch(console.error);
