"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOctokitThrottleOptions = void 0;
const bottleneck_1 = __importDefault(require("bottleneck"));
const ioredis_1 = __importDefault(require("ioredis"));
function getOctokitThrottleOptions(options) {
    let { log, redisConfig } = options;
    if (!redisConfig)
        return;
    const connection = new bottleneck_1.default.IORedisConnection({
        client: getRedisClient(options),
    });
    connection.on("error", (error) => {
        log.error(Object.assign(error, { source: "bottleneck" }));
    });
    return {
        Bottleneck: bottleneck_1.default,
        connection,
    };
}
exports.getOctokitThrottleOptions = getOctokitThrottleOptions;
function getRedisClient({ log, redisConfig }) {
    if (redisConfig)
        return new ioredis_1.default(redisConfig);
}
//# sourceMappingURL=get-octokit-throttle-options.js.map