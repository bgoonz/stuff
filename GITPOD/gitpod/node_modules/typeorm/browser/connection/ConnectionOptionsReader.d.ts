import { ConnectionOptions } from "./ConnectionOptions";
/**
 * Reads connection options from the ormconfig.
 * Can read from multiple file extensions including env, json, js, xml and yml.
 */
export declare class ConnectionOptionsReader {
    protected options: {
        root?: string | undefined;
        configName?: string | undefined;
    } | undefined;
    constructor(options?: {
        root?: string | undefined;
        configName?: string | undefined;
    } | undefined);
    /**
     * Returns all connection options read from the ormconfig.
     */
    all(): Promise<ConnectionOptions[]>;
    /**
     * Gets a connection with a given name read from ormconfig.
     * If connection with such name would not be found then it throw error.
     */
    get(name: string): Promise<ConnectionOptions>;
    /**
     * Loads all connection options from a configuration file.
     *
     * todo: get in count NODE_ENV somehow
     */
    protected load(): Promise<ConnectionOptions[]>;
    /**
     * Normalize connection options.
     */
    protected normalizeConnectionOptions(connectionOptions: ConnectionOptions | ConnectionOptions[]): ConnectionOptions[];
    /**
     * Gets directory where configuration file should be located and configuration file name without extension.
     */
    protected readonly baseFilePath: string;
    /**
     * Gets directory where configuration file should be located.
     */
    protected readonly baseDirectory: string;
    /**
     * Gets configuration file name.
     */
    protected readonly baseConfigName: string;
}
