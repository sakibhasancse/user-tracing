import { Kafka } from "kafkajs";

const brokers = ["kafka1:9092", "kafka2:9093"];
const kafka = new Kafka({ clientId: "email-service", brokers });

const consumer = kafka.consumer({ groupId: "email-group" });
const producer = kafka.producer();

async function processOrder(order) {
  // Simulate processing
  if (!order.item || !order.price) {
    throw new Error("Invalid order data");
  }
  console.log(`[Consumer] Processed order ${order.id}`);
}

async function startConsumer() {
  await producer.connect();
  await consumer.connect();
  await consumer.subscribe({ topic: "order-topic", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const order = JSON.parse(message.value.toString());
      let attempts = 0;
      const maxRetries = 3;

      while (attempts < maxRetries) {
        try {
          await processOrder(order);
          return; // success, exit loop
        } catch (err) {
          attempts++;
          console.warn(
            `[Consumer] Error processing order ${order.id}, attempt ${attempts}: ${err.message}`
          );
        }
      }

      // After retries, send to Dead-Letter Topic
      await producer.send({
        topic: "order-dlt",
        messages: [{ value: JSON.stringify(order) }],
      });
      console.error(`[Consumer] Sent order ${order.id} to DLT`);
    },
  });

  console.log("🚀 Consumer connected with DLT handling");
}

startConsumer().catch(console.error);
