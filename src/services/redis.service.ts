// redis.service.ts

import { Injectable } from '@nestjs/common';
import { createClient } from 'redis';

@Injectable()
export class RedisService {
  private readonly redisClient: ReturnType<typeof createClient>;

  constructor() {
    // Initialize the Redis client
    this.redisClient = createClient({
      url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
      password: `${process.env.REDIS_PASSWORD}`,
      database: parseInt(`${process.env.REDIS_DB}`),
    });
  }

  init() {
    console.log('redis connected');
    this.redisClient.connect();
  }

  async set(key: string, value: any, expireIn?: number): Promise<void> {
    if (this.redisClient.isOpen === false) {
      this.init();
    }
    await this.redisClient.set(key, value);
    if (expireIn) {
      await this.redisClient.expire(key, expireIn);
    }
  }

  async get(key: string): Promise<any | null> {
    if (this.redisClient.isOpen === false) {
      this.init();
    }
    const value = await this.redisClient.get(key);
    return value ? JSON.parse(value) : null;
  }

  async statusUpdate(key: string, data: any) {
    // try {
    if (this.redisClient.isOpen === false) {
      this.init();
    }

    const existingData = await this.get(key);

    // console.log(key);

    if (data.status) {
      existingData.status = data.status;
    }

    if (data.deskId) {
      existingData.deskId = data.deskId;
    }

    if (data.jackpotId) {
      existingData.jackpotId = data.jackpotId;
    }

    this.redisClient.set(key, JSON.stringify(existingData));
    // } catch (error) {
    //   console.error('Error in statusUpdate:', error);
    // }
  }

  async del(key: string): Promise<void> {
    if (this.redisClient.isOpen === false) {
      this.init();
    }
    await this.redisClient.del(key);
  }

  async keys(pattern: string): Promise<string[]> {
    if (this.redisClient.isOpen === false) {
      this.init();
    }
    return this.redisClient.keys(pattern);
  }

  // Add more methods as needed for your use case

  async getConnectedClients(): Promise<any[]> {
    if (this.redisClient.isOpen === false) {
      this.init();
    }

    const pattern = '*'; // You can adjust the pattern based on your key structure
    const keys = await this.redisClient.keys(pattern);

    const connectedClients: any[] = [];

    for (const key of keys) {
      const clientInfo = await this.get(key);
      if (clientInfo && clientInfo.status === 'CONNECTED') {
        connectedClients.push(clientInfo);
      }
    }

    return connectedClients;
  }

  async getRecordsByFilter(
    filterKey: string,
    filterValue: string,
  ): Promise<any[]> {
    if (this.redisClient.isOpen === false) {
      this.init();
    }

    const pattern = '*'; // You can adjust the pattern based on your key structure
    const keys = await this.redisClient.keys(pattern);

    const connectedClients: any[] = [];

    for (const key of keys) {
      const clientInfo = await this.get(key);
      if (
        clientInfo &&
        clientInfo[filterKey] === filterValue &&
        clientInfo.status == 'CONNECTED'
      ) {
        connectedClients.push(clientInfo);
      }
    }

    return connectedClients;
  }

  async disConnectNonWorkingClients(connectedClients: any[]) {
    const keys = await this.keys('*');
    const lst = [];
    // console.log(connectedClients);
    connectedClients.forEach((c) => {
      lst.push(c.id);
    });
    // console.log(lst);
    for (const key of keys) {
      const clientInfo = await this.get(key);

      if (clientInfo && !lst.includes(clientInfo.id)) {
        const update = {
          status: 'DISCONNECTED',
        };
        await this.statusUpdate(key, update);
      }
    }
  }

  async clearRedis() {
    const keys = await this.keys('*');
    for (const key of keys) {
      const clientInfo = await this.get(key);
      if (clientInfo && clientInfo.status == 'DISCONNECTED') {
        await this.del(key);
      }
    }
  }

  async getActiveClientInfo(results: any[]) {
    const keys = await this.keys('*');
    const res = [];
    for (const key of keys) {
      const clientInfo = await this.get(key);
      if (
        clientInfo &&
        results.includes(clientInfo.id) &&
        clientInfo.status == 'CONNECTED'
      ) {
        res.push(clientInfo);
      }
    }
    return res;
  }
}
