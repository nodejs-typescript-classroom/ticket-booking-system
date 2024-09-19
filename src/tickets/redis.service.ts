import { BadRequestException, Injectable, InternalServerErrorException, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import * as fs from 'fs/promises';
import * as path from 'path';
import { EventCounterDto } from './dto/event-counter.dto';
import { EventCounterEntity } from './schema/event-counter.entity';
@Injectable()
export class RedisService implements OnModuleDestroy {
  private logger: Logger = new Logger(RedisService.name);
  private connect_url: string = '';
  private script_sha: string = '';
  private connection: Redis; 
  constructor(
    private readonly configService: ConfigService,
  ) {
    this.connect_url = this.configService.getOrThrow<string>('REDIS_URL');
    this.connection = new Redis(
      this.connect_url,
      {
        reconnectOnError(err:Error) {
          const targetError = 'READONLY';
          if (err.message.includes(targetError)) {
            // Only reconnect when the error contains "READONLY"
            return true; // or `return 1;`
          }
        },
        retryStrategy(times) {
          const delay = Math.min(times * 50, 2000);
          return delay;
        }
    });
    // setup on event binding
    this.connection.on('connect', this.handleConnect.bind(this));
    this.connection.on('ready', this.handleReady.bind(this));
    this.connection.on('close', this.handleClose.bind(this));
    this.connection.on('error', this.handleError.bind(this));
    this.connection.on('reconnecting', this.handleReconnecting.bind(this));
    this.connection.on('end', this.handleEnd.bind(this));
    this.loadLuaScript();
  }
  private handleConnect() {
    this.logger.log({ 
      message: 'redis connecting...',
      url: this.connect_url,
      type: 'REDIS_CONNECTING'
    });
  }
  private handleReady() {
    this.logger.log({
      message: 'redis connected',
      url: this.connect_url,
      type: 'REDIS_CONNECTED'
    });
  }
  private handleClose() {
    this.logger.warn({
      message: 'redis disconnected',
      url: this.connect_url,
      type: 'REDIS_DISCONNECTED'
    });
  }
  private handleError(err: unknown) {
    const error: Error = err as Error;
    this.logger.error({
      message: 'redis error occured',
      url: this.connect_url,
      type: 'REDIS_ERROR',
      err: error,
    })
  }
  private handleReconnecting() {
    this.logger.log({
      message: 'redis reconnecting',
      url: this.connect_url,
      type: 'REDIS_RECONNECTING',
    });
  }
  private handleEnd() {
    this.logger.log({
      message: 'redis connection ended',
      url: this.connect_url,
      type: 'REDIS_CONNECTION_ENDED'
    });
  }
  onModuleDestroy() {
    this.connection.disconnect(false);
  }
  private async checkLuaScript(sha: string) {
    return new Promise<boolean>((resolve, reject) => {
      if (sha === '') {
        resolve(false);
      }
      this.connection.script('EXISTS' ,sha, (err, result)=> {
        if (err) {
          reject(err);
        }
        resolve(result[0]===1);
      })
    });
  }
  async hasKey(key: string) {
    return new Promise<boolean>((resolve, reject) => {
      this.connection.get(`${key}:total`, (err, result) => {
        if (err) {
          reject(err);
          return
        }
        resolve(result != null);
      })
    });
  }
  async getCount(key: string):Promise<EventCounterEntity> {
    try {
      const totalPromise = new Promise<string>((resolve, reject) => {
        this.connection.get(`${key}:total`, (err, result) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(result);
        });
      });
      const joinPromise = new Promise<string>((resolve, reject) => {
        this.connection.get(`${key}:join`, (err, result) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(result);
        });
      });
      const [total, join] = await Promise.all([totalPromise, joinPromise]);
      return {
        eventId: key,
        totalTicketNumber: parseInt(total),
        attendeeNumber: parseInt(join),
      }
    } catch (err: unknown) {
      const error: Error = err as Error;
    }
  }
  async executeLuaScript(eventCounterDto: EventCounterDto) {
    try {
      const isLoad = await this.checkLuaScript(this.script_sha);
      if (!isLoad) {
        await this.loadLuaScript();
      }
      const resultPromise = new Promise((resolve, reject) => {
        this.connection.evalsha(this.script_sha, 
          1,
          eventCounterDto.eventId, 
          eventCounterDto.requestTotal,
          eventCounterDto.requestJoin,
          eventCounterDto.accumTotal,
          eventCounterDto.accumJoin,
        (err, result) => {
          if (err) {
            reject(err);
          }
          resolve(result);
        });
      });
      const result = await resultPromise;
      const total = parseInt(result[0]);
      const join = parseInt(result[1]);
      const isValid = parseInt(result[2]) == 1;
      const errMessage = result[3];
      if (!isValid) {
        throw new BadRequestException({
          message: errMessage,
          type: 'LUA_SCRIPT_EXEC_FAILED'
        });
      }
      return {
        total: total,
        join: join,
      }
    } catch (err: unknown) {
      const error: Error = err as Error;
      if ( error instanceof BadRequestException || error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new InternalServerErrorException({
        message: 'execute lua script failed',
        error: error,
        type: 'LUA_SCRIPT_EXEC_FAILED'
      })
    }
  }
  private async loadLuaScript() {
    try {
      const luaScript = await fs.readFile(path.join(__dirname, '..','lua', 'event_counter.lua')); 
      const resultPromise =  new Promise<string>((resolve, reject) => {
        this.connection.script('LOAD', luaScript , (err, result) => {
          if (err) {
            reject(err);
          }
          const sha: string = result as string;
          this.script_sha = sha;
          this.logger.log({
            message: 'lua sript loaded',
            script_sha: sha,
            type: 'LUA_SCRIPT_LOAD'
          });
          resolve(sha);
        });
      });
      return await resultPromise;
    } catch (err: unknown) {
      const error: Error = err as Error;
      this.logger.error({message: error.message, error});
      throw new InternalServerErrorException({
        message: 'luascript load failed',
        error: error,
        type: 'LUA_LOAD_FAILED'
      });
    }
  }  

}