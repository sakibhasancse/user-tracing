const { kafka, TOPICS } = require('../config/kafka');
const { v4: uuidv4 } = require('uuid');

const producer = kafka.producer();

const eventTypes = ['page_view', 'click', 'scroll', 'session_start', 'session_end'];
const pages = ['/home', '/products', '/about', '/contact', '/checkout'];

// Simulate users (some returning, some new)
const generateUserId = () => {
  const isReturningUser = Math.random() > 0.3;
  if (isReturningUser && existingUsers.length > 0) {
    return existingUsers[Math.floor(Math.random() * existingUsers.length)];
  }
  const newUser = `user_${uuidv4().slice(0, 8)}`;
  existingUsers.push(newUser);
  return newUser;
};

const existingUsers = [];

const generateEvent = () => {
  return {
    userId: generateUserId(),
    eventType: eventTypes[Math.floor(Math.random() * eventTypes.length)],
    page: pages[Math.floor(Math.random() * pages.length)],
    timestamp: new Date().toISOString(),
    sessionId: `session_${Math.floor(Math.random() * 100)}`,
    metadata: {
      browser: ['Chrome', 'Firefox', 'Safari'][Math.floor(Math.random() * 3)],
      device: ['mobile', 'desktop', 'tablet'][Math.floor(Math.random() * 3)]
    }
  };
};

const produceEvents = async () => {
  await producer.connect();
  console.log('✅ Producer connected');

  // Produce events continuously
  setInterval(async () => {
    const event = generateEvent();
    
    await producer.send({
      topic: TOPICS.USER_EVENTS,
      messages: [{
        key: event.userId,
        value: JSON.stringify(event),
        headers: {
          'event-type': event.eventType
        }
      }]
    });

    console.log(`📤 Event produced: ${event.eventType} by ${event.userId}`);
  }, 1000); // Event every second
};

produceEvents().catch(console.error);