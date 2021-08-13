import Bottleneck from "bottleneck";
import Redis from "ioredis";
import { Logger } from "pino";
declare type Options = {
    log: Logger;
    redisConfig?: Redis.RedisOptions | string;
};
export declare function getOctokitThrottleOptions(options: Options): {
    Bottleneck: typeof Bottleneck;
    connection: Bottleneck.IORedisConnection;
} | undefined;
export {};
