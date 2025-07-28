const { createClient } = require("redis");

class CacheService {
  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
    });

    this.client.on("error", (err) => {
      console.error("❌ Redis error:", err);
    });

    this.connect();
  }

  async connect() {
    try {
      await this.client.connect();
      console.log("✅ Redis connected");
    } catch (err) {
      console.error("❌ Redis connect failed:", err.message);
    }
  }

  async get(key) {
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      console.error("Redis GET error:", err);
      return null;
    }
  }

  async set(key, value, ttl = 3600) {
    try {
      await this.client.setEx(key, ttl, JSON.stringify(value));
    } catch (err) {
      console.error("Redis SET error:", err);
    }
  }

  async blacklistToken(token, expiry = Math.floor(Date.now() / 1000) + 3600) {
    const ttl = Math.max(0, expiry - Math.floor(Date.now() / 1000));
    await this.set(`blacklisted:${token}`, true, ttl);
  }

  async isTokenBlacklisted(token) {
    const result = await this.get(`blacklisted:${token}`);
    return result || false;
  }
}

const cacheService = new CacheService();
module.exports = cacheService;
