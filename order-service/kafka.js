import { Kafka } from "kafkajs";

const brokers = process.env.KAFKA_BROKERS.split(",");

const kafka = new Kafka({
  clientId: "order-service",
  brokers,
});

export const producer = kafka.producer();

export async function connectProducer() {
  await producer.connect()l;
  console.log("🚀 Kafka Producer connected");
}
