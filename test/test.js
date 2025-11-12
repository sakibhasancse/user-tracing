import autocannon from "autocannon";

autocannon({
  url: "http://localhost:4001/order",
  connections: 20, 
  duration: 10,   
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ id: 1, item: "Laptop", price: 1000 }),
}, console.log);
