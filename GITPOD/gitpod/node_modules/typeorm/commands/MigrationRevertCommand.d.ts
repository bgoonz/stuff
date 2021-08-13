/**
 * Reverts last migration command.
 */
export declare class MigrationRevertCommand {
    command: string;
    describe: string;
    builder(yargs: any): any;
    handler(argv: any): Promise<void>;
}
