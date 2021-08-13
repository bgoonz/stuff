import { Transport } from './../enums/transport.enum';
import { RedisOptions, NatsOptions, MqttOptions, GrpcOptions, RmqOptions } from './microservice-configuration.interface';
export declare type ClientOptions = RedisOptions | NatsOptions | MqttOptions | GrpcOptions | TcpClientOptions | RmqOptions;
export interface TcpClientOptions {
    transport: Transport.TCP;
    options?: {
        host?: string;
        port?: number;
    };
}
