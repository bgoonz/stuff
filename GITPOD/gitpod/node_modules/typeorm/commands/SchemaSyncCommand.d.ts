/**
 * Synchronizes database schema with entities.
 */
export declare class SchemaSyncCommand {
    command: string;
    describe: string;
    builder(yargs: any): any;
    handler(argv: any): Promise<void>;
}
