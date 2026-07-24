import { Redis } from "ioredis";

// Cached across hot-reloads in dev, same pattern as connectToDatabase() in db.ts.
declare global {
  var redisClient: Redis | undefined;
}

export function getRedisClient(): Redis {
  if (!global.redisClient) {
    global.redisClient = new Redis({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
      username: process.env.REDIS_USERNAME,
      password: process.env.REDIS_PASSWORD,
      lazyConnect: false,
      maxRetriesPerRequest: 1,
    });
  }
  return global.redisClient;
}
