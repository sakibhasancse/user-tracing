const { kafka, TOPICS } = require('../config/kafka');

const consumer = kafka.consumer({ groupId: 'stream-processor' });
const producer = kafka.producer();

const windowedUsers = new Map(); // Time-windowed unique users
const WINDOW_SIZE = 60000; // 1 minute windows

const processStream = async () => {
  await consumer.connect();
  await producer.connect();
  console.log('✅ Stream processor connected');

  await consumer.subscribe({ topic: TOPICS.USER_EVENTS });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const event = JSON.parse(message.value.toString());
      const timestamp = new Date(event.timestamp).getTime();
      const windowKey = Math.floor(timestamp / WINDOW_SIZE);

      if (!windowedUsers.has(windowKey)) {
        windowedUsers.set(windowKey, new Set());
      }

      windowedUsers.get(windowKey).add(event.userId);

      // Produce aggregated results
      await producer.send({
        topic: TOPICS.UNIQUE_USERS,
        messages: [{
          key: windowKey.toString(),
          value: JSON.stringify({
            window: new Date(windowKey * WINDOW_SIZE).toISOString(),
            uniqueUserCount: windowedUsers.get(windowKey).size,
            timestamp: new Date().toISOString()
          })
        }]
      });

      console.log(`📈 Window ${windowKey}: ${windowedUsers.get(windowKey).size} unique users`);

      // Clean old windows (keep last 10 windows)
      if (windowedUsers.size > 10) {
        const oldestKey = Math.min(...windowedUsers.keys());
        windowedUsers.delete(oldestKey);
      }
    }
  });
};

processStream().catch(console.error);