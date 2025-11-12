const express = require("express");
const cors = require("cors");
const { kafka, TOPICS } = require("../config/kafka");
const { v4: uuidv4 } = require("uuid");

const app = express();
const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: "api-metrics-reader" });

app.use(cors());
app.use(express.json());

// Store real-time metrics
const metrics = {
  uniqueUsers: new Set(),
  totalEvents: 0,
  eventsByType: {},
  lastUpdate: new Date(),
};

// Initialize Kafka
const initKafka = async () => {
  await producer.connect();
  await consumer.connect();

  await consumer.subscribe({ topic: TOPICS.USER_EVENTS });

  consumer.run({
    eachMessage: async ({ message }) => {
      const event = JSON.parse(message.value.toString());
      metrics.uniqueUsers.add(event.userId);
      metrics.totalEvents++;
      metrics.eventsByType[event.eventType] =
        (metrics.eventsByType[event.eventType] || 0) + 1;
      metrics.lastUpdate = new Date();
    },
  });

  console.log("✅ Kafka connected to API server");
};

// API Endpoints

// Track a user event
app.post("/api/track", async (req, res) => {
  try {
    const event = {
      userId: req.body.userId || `user_${uuidv4().slice(0, 8)}`,
      eventType: req.body.eventType || "page_view",
      page: req.body.page || "/",
      timestamp: new Date().toISOString(),
      sessionId: req.body.sessionId || `session_${uuidv4().slice(0, 8)}`,
      metadata: req.body.metadata || {},
    };

    await producer.send({
      topic: TOPICS.USER_EVENTS,
      messages: [
        {
          key: event.userId,
          value: JSON.stringify(event),
        },
      ],
    });

    res.json({ success: true, event });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get real-time metrics
app.get("/api/metrics", (req, res) => {
  res.json({
    uniqueUsers: metrics.uniqueUsers.size,
    totalEvents: metrics.totalEvents,
    eventsByType: metrics.eventsByType,
    lastUpdate: metrics.lastUpdate,
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date() });
});

const PORT = process.env.PORT || 3000;

initKafka()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch(console.error);
