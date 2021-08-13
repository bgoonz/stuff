/**
 * Shows sql to be executed by schema:sync command.
 */
export declare class SchemaLogCommand {
    command: string;
    describe: string;
    builder(yargs: any): any;
    handler(argv: any): Promise<void>;
}
