import { Probot } from "../probot";
import { ApplicationFunctionOptions } from "../types";
export declare const setupAppFactory: (host: string | undefined, port: number | undefined) => (app: Probot, { getRouter }: ApplicationFunctionOptions) => Promise<void>;
