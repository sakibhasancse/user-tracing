import express from 'express'
import { connectConsumer } from './kafka.js'

const app = express()

app.listen(4002, async () => {
  await connectConsumer()
  console.log('✅ Email Service running on port 4002')
})
