import { Kafka } from "kafkajs";

const brokers = process.env.KAFKA_BROKERS.split(",");
const groupId = process.env.GROUP_ID || "email-group";

const kafka = new Kafka({
  clientId: "email-service",
  brokers,
});

export const consumer = kafka.consumer({ groupId });

export async function connectConsumer() {
  await consumer.connect();
  await consumer.subscribe({ topic: "order-topic", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const order = JSON.parse(message.value.toString());
      console.log(`[${groupId}] Received order:`, order);
    },
  });

  console.log(`📨 Kafka Consumer connected (Group: ${groupId})`);
}
