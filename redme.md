### Start the application:
```bash
# 1. Start Kafka
docker compose -f docker-compose.kafka.yml -d up

# 2. Start all services
docker compose -f docker-compose.services.yml -d up

```

### Access points:
- **API Server**: http://localhost:3000
- **Kafka UI**: http://localhost:8080
- **Metrics**: http://localhost:3000/api/metrics

### Test the API:
```bash
# Track a custom event
curl -X POST http://localhost:3000/api/track \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user_123",
    "eventType": "button_click",
    "page": "/dashboard"
  }'

# Get current metrics
curl http://localhost:3000/api/metrics
```