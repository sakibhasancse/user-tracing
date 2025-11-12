const { kafka, TOPICS } = require('../config/kafka');

const consumer = kafka.consumer({ 
  groupId: 'user-counter-group',
  sessionTimeout: 30000,
  heartbeatInterval: 3000
});

const uniqueUsers = new Set();
const userSessions = new Map();

const processUserEvent = async (message) => {
  const event = JSON.parse(message.value.toString());
  
  // Track unique users
  uniqueUsers.add(event.userId);
  
  // Track sessions
  if (!userSessions.has(event.sessionId)) {
    userSessions.set(event.sessionId, {
      userId: event.userId,
      startTime: event.timestamp,
      eventCount: 0
    });
  }
  
  const session = userSessions.get(event.sessionId);
  session.eventCount++;
  session.lastEvent = event.timestamp;

  console.log(`
📊 Current Stats:
   Unique Users: ${uniqueUsers.size}
   Active Sessions: ${userSessions.size}
   Latest Event: ${event.eventType} by ${event.userId}
  `);
};

const runConsumer = async () => {
  await consumer.connect();
  console.log('✅ Consumer connected');

  await consumer.subscribe({ 
    topic: TOPICS.USER_EVENTS, 
    fromBeginning: false 
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        await processUserEvent(message);
      } catch (error) {
        console.error('Error processing message:', error);
      }
    },
  });
};

runConsumer().catch(console.error);