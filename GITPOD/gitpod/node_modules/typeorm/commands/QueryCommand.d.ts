/**
 * Executes an sql query on the given connection.
 */
export declare class QueryCommand {
    command: string;
    describe: string;
    builder(yargs: any): any;
    handler(argv: any): Promise<void>;
}
