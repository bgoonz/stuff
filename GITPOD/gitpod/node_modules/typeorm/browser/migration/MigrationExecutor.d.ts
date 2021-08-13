import { Connection } from "../connection/Connection";
import { Migration } from "./Migration";
import { QueryRunner } from "../query-runner/QueryRunner";
/**
 * Executes migrations: runs pending and reverts previously executed migrations.
 */
export declare class MigrationExecutor {
    protected connection: Connection;
    protected queryRunner: QueryRunner | undefined;
    private migrationsTableName;
    constructor(connection: Connection, queryRunner?: QueryRunner | undefined);
    /**
     * Executes all pending migrations. Pending migrations are migrations that are not yet executed,
     * thus not saved in the database.
     */
    executePendingMigrations(): Promise<void>;
    /**
     * Reverts last migration that were run.
     */
    undoLastMigration(): Promise<void>;
    /**
     * Creates table "migrations" that will store information about executed migrations.
     */
    protected createMigrationsTableIfNotExist(queryRunner: QueryRunner): Promise<void>;
    /**
     * Loads all migrations that were executed and saved into the database.
     */
    protected loadExecutedMigrations(queryRunner: QueryRunner): Promise<Migration[]>;
    /**
     * Gets all migrations that setup for this connection.
     */
    protected getMigrations(): Migration[];
    /**
     * Finds the latest migration (sorts by timestamp) in the given array of migrations.
     */
    protected getLatestMigration(migrations: Migration[]): Migration | undefined;
    /**
     * Inserts new executed migration's data into migrations table.
     */
    protected insertExecutedMigration(queryRunner: QueryRunner, migration: Migration): Promise<void>;
    /**
     * Delete previously executed migration's data from the migrations table.
     */
    protected deleteExecutedMigration(queryRunner: QueryRunner, migration: Migration): Promise<void>;
}
