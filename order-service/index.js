import express from "express";
import { producer, connectProducer } from "./kafka.js";

const app = express();
app.use(express.json());

const PORT = 4001;

await connectProducer();

app.post("/order", async (req, res) => {
  const order = req.body;

  try {
    await producer.send({
      topic: "order-topic",
      messages: [{ value: JSON.stringify(order) }],
    });

    res.status(200).send({ status: "order sent", order });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to send order" });
  }
});

app.listen(PORT, () => {
  console.log(`📦 Order service running at http://localhost:${PORT}`);
});
