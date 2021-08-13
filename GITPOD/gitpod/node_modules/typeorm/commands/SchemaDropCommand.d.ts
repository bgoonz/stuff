/**
 * Drops all tables of the database from the given connection.
 */
export declare class SchemaDropCommand {
    command: string;
    describe: string;
    builder(yargs: any): any;
    handler(argv: any): Promise<void>;
}
