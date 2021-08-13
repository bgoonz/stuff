/**
 * Clear cache command.
 */
export declare class CacheClearCommand {
    command: string;
    describe: string;
    builder(yargs: any): any;
    handler(argv: any): Promise<void>;
}
