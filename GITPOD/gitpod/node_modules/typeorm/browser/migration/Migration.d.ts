import { MigrationInterface } from "./MigrationInterface";
/**
 * Represents entity of the migration in the database.
 */
export declare class Migration {
    /**
     * Timestamp of the migration.
     */
    timestamp: number;
    /**
     * Name of the migration (class name).
     */
    name: string;
    /**
     * Migration instance that needs to be run.
     */
    instance?: MigrationInterface;
    constructor(timestamp: number, name: string, instance?: MigrationInterface);
}
