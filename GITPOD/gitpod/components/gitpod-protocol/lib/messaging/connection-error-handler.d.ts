import { Message } from "vscode-jsonrpc";
export interface ResolvedConnectionErrorHandlerOptions {
  readonly serverName: string;
  /**
   * The maximum amount of errors allowed before stopping the server.
   */
  readonly maxErrors: number;
  /**
   * The maimum amount of restarts allowed in the restart interval.
   */
  readonly maxRestarts: number;
  /**
   * In minutes.
   */
  readonly restartInterval: number;
}
export declare type ConnectionErrorHandlerOptions =
  Partial<ResolvedConnectionErrorHandlerOptions> & {
    readonly serverName: string;
  };
export declare class ConnectionErrorHandler {
  protected readonly options: ResolvedConnectionErrorHandlerOptions;
  constructor(options: ConnectionErrorHandlerOptions);
  shouldStop(error: Error, message?: Message, count?: number): boolean;
  protected readonly restarts: number[];
  shouldRestart(): boolean;
}
//# sourceMappingURL=connection-error-handler.d.ts.map
