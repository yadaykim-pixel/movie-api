import { createClient } from "redis";

const port = Number(process.env.REDIS_PORT);
export const redisConfigured = Boolean(
  process.env.REDIS_HOST && Number.isInteger(port) && port > 0 && port < 65536,
);

export const redis = createClient({
  username: process.env.REDIS_USERNAME || "default",
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST || "localhost",
    port: redisConfigured ? port : 6379,
    tls: process.env.REDIS_TLS === "true",
    connectTimeout: 5000,
    reconnectStrategy: false,
  },
  disableOfflineQueue: true,
});

redis.on("error", (error) => {
  console.error("Redis 연결 오류:", error.message);
});
