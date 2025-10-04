import { Redis } from 'ioredis';

// Create a Redis instance with the URL from environment variables
const redis = new Redis(process.env.REDIS_URL || '');

export interface RedisHandlerOptions {
  expirationTime?: number; // in seconds
}

class RedisHandler {
  private static instance: RedisHandler;
  private client: Redis;
  private defaultExpiration = 3600; // 1 hour in seconds

  private constructor() {
    this.client = redis;
    this.client.on('error', (err) => console.error('Redis Client Error:', err));
    // this.client.on('connect', () => console.log('Redis Client Connected'));
  }

  public static getInstance(): RedisHandler {
    if (!RedisHandler.instance) {
      RedisHandler.instance = new RedisHandler();
    }
    return RedisHandler.instance;
  }

  /**
   * Set a value in Redis
   * @param key - The key to store the value under
   * @param value - The value to store (will be JSON stringified)
   * @param options - Optional settings like expiration time
   */
  public async set(key: string, value: any, options: RedisHandlerOptions = {}): Promise<void> {
    try {
      const stringValue = JSON.stringify(value);
      const expiration = options.expirationTime || this.defaultExpiration;
      
      await this.client.setex(key, expiration, stringValue);
    } catch (error) {
      console.error('Redis Set Error:', error);
      throw error;
    }
  }

  /**
   * Get a value from Redis
   * @param key - The key to retrieve the value for
   * @returns The parsed value or null if not found
   */
  public async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      if (!value) return null;
      
      return JSON.parse(value) as T;
    } catch (error) {
      console.error('Redis Get Error:', error);
      throw error;
    }
  }

  /**
   * Delete a key from Redis
   * @param key - The key to delete
   */
  public async delete(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error('Redis Delete Error:', error);
      throw error;
    }
  }

  /**
   * Check if a key exists in Redis
   * @param key - The key to check
   * @returns boolean indicating if the key exists
   */
  public async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Redis Exists Error:', error);
      throw error;
    }
  }

  /**
   * Get the remaining time to live for a key in seconds
   * @param key - The key to check
   * @returns number of seconds remaining or -1 if key doesn't exist
   */
  public async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      console.error('Redis TTL Error:', error);
      throw error;
    }
  }

  /**
   * Set multiple key-value pairs in Redis
   * @param keyValuePairs - Array of key-value pairs to set
   * @param options - Optional settings like expiration time
   */
  public async mset(
    keyValuePairs: Array<{ key: string; value: any }>,
    options: RedisHandlerOptions = {}
  ): Promise<void> {
    try {
      const pipeline = this.client.pipeline();
      const expiration = options.expirationTime || this.defaultExpiration;

      keyValuePairs.forEach(({ key, value }) => {
        const stringValue = JSON.stringify(value);
        pipeline.setex(key, expiration, stringValue);
      });

      await pipeline.exec();
    } catch (error) {
      console.error('Redis Multi Set Error:', error);
      throw error;
    }
  }

  /**
   * Get multiple values from Redis
   * @param keys - Array of keys to retrieve
   * @returns Array of parsed values (null for keys that don't exist)
   */
  public async mget<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      const values = await this.client.mget(keys);
      return values.map(value => value ? JSON.parse(value) as T : null);
    } catch (error) {
      console.error('Redis Multi Get Error:', error);
      throw error;
    }
  }

  public async keys(pattern: string): Promise<string[]> {
    try {
      return await this.client.keys(pattern);
    } catch (error) {
      console.error('Redis Keys Error:', error);
      throw error;
    }
  }
}

export const redisHandler = RedisHandler.getInstance();
