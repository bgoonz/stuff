import { Options as PinoOptions } from "@probot/pino";
import { Options } from "../types";
export declare function readCliOptions(argv: string[]): Options & PinoOptions & {
    args: string[];
};
