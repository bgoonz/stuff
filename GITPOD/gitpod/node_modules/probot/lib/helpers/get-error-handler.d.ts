import type { Logger } from "pino";
export declare function getErrorHandler(log: Logger): (error: Error) => void;
