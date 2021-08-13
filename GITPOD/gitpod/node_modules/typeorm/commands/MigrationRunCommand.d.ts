/**
 * Runs migration command.
 */
export declare class MigrationRunCommand {
    command: string;
    describe: string;
    builder(yargs: any): any;
    handler(argv: any): Promise<void>;
}
