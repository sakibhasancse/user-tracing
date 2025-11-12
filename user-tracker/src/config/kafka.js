const { Kafka } = require("kafkajs");
const brokers = (process.env.KAFKA_BROKERS || "kafka1:9092,kafka2:9093").split(
  ","
);

const kafka = new Kafka({
  clientId: "user-tracker-app",
  brokers: brokers,
  //   retry: {
  //     initialRetryTime: 100,
  //     retries: 8,
  //   },
});

const TOPICS = {
  USER_EVENTS: "user-events",
  USER_SESSIONS: "user-sessions",
  UNIQUE_USERS: "unique-users-count",
};

module.exports = { kafka, TOPICS };
