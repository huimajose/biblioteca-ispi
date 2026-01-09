import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
});

redis.on("connect", () => {
  console.log("✅ Redis conectado");
});

redis.on("error", err => {
  console.error("❌ Redis error:", err.message);
});

export default redis;
