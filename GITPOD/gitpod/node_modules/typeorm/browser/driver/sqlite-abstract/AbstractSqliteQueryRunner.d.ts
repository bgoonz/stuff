import { QueryRunner } from "../../query-runner/QueryRunner";
import { ObjectLiteral } from "../../common/ObjectLiteral";
import { TableColumn } from "../../schema-builder/schema/TableColumn";
import { Table } from "../../schema-builder/schema/Table";
import { TableIndex } from "../../schema-builder/schema/TableIndex";
import { TableForeignKey } from "../../schema-builder/schema/TableForeignKey";
import { AbstractSqliteDriver } from "./AbstractSqliteDriver";
import { Connection } from "../../connection/Connection";
import { ReadStream } from "../../platform/PlatformTools";
import { EntityManager } from "../../entity-manager/EntityManager";
import { InsertResult } from "../InsertResult";
/**
 * Runs queries on a single sqlite database connection.
 *
 * Does not support compose primary keys with autoincrement field.
 * todo: need to throw exception for this case.
 */
export declare class AbstractSqliteQueryRunner implements QueryRunner {
    /**
     * Database driver used by connection.
     */
    driver: AbstractSqliteDriver;
    /**
     * Connection used by this query runner.
     */
    connection: Connection;
    /**
     * Isolated entity manager working only with current query runner.
     */
    manager: EntityManager;
    /**
     * Indicates if connection for this query runner is released.
     * Once its released, query runner cannot run queries anymore.
     */
    isReleased: boolean;
    /**
     * Indicates if transaction is in progress.
     */
    isTransactionActive: boolean;
    /**
     * Stores temporarily user data.
     * Useful for sharing data with subscribers.
     */
    data: {};
    /**
     * Indicates if special query runner mode in which sql queries won't be executed is enabled.
     */
    protected sqlMemoryMode: boolean;
    /**
     * Sql-s stored if "sql in memory" mode is enabled.
     */
    protected sqlsInMemory: string[];
    constructor(driver: AbstractSqliteDriver);
    /**
     * Creates/uses database connection from the connection pool to perform further operations.
     * Returns obtained database connection.
     */
    connect(): Promise<any>;
    /**
     * Releases used database connection.
     * We don't do anything here because sqlite do not support multiple connections thus query runners.
     */
    release(): Promise<void>;
    /**
     * Starts transaction.
     */
    startTransaction(): Promise<void>;
    /**
     * Commits transaction.
     * Error will be thrown if transaction was not started.
     */
    commitTransaction(): Promise<void>;
    /**
     * Rollbacks transaction.
     * Error will be thrown if transaction was not started.
     */
    rollbackTransaction(): Promise<void>;
    /**
     * Executes a given SQL query.
     */
    query(query: string, parameters?: any[]): Promise<any>;
    /**
     * Returns raw data stream.
     */
    stream(query: string, parameters?: any[], onEnd?: Function, onError?: Function): Promise<ReadStream>;
    /**
     * Insert a new row with given values into the given table.
     * Returns value of the generated column if given and generate column exist in the table.
     */
    insert(tableName: string, keyValues: ObjectLiteral): Promise<InsertResult>;
    /**
     * Updates rows that match given conditions in the given table.
     */
    update(tableName: string, valuesMap: ObjectLiteral, conditions: ObjectLiteral): Promise<void>;
    /**
     * Deletes from the given table by a given conditions.
     */
    delete(tableName: string, conditions: ObjectLiteral | string, maybeParameters?: any[]): Promise<void>;
    /**
     * Inserts rows into closure table.
     */
    insertIntoClosureTable(tableName: string, newEntityId: any, parentId: any, hasLevel: boolean): Promise<number>;
    /**
     * Loads given table's data from the database.
     */
    getTable(tableName: string): Promise<Table | undefined>;
    /**
     * Loads all tables (with given names) from the database and creates a Table from them.
     */
    getTables(tableNames: string[]): Promise<Table[]>;
    /**
     * Checks if database with the given name exist.
     */
    hasDatabase(database: string): Promise<boolean>;
    /**
     * Checks if table with the given name exist in the database.
     */
    hasTable(tableName: string): Promise<boolean>;
    /**
     * Creates a database if it's not created.
     */
    createDatabase(database: string): Promise<void[]>;
    /**
     * Creates a schema if it's not created.
     */
    createSchema(schemas: string[]): Promise<void[]>;
    /**
     * Creates a new table from the given table metadata and column metadatas.
     */
    createTable(table: Table): Promise<void>;
    /**
     * Drops the table.
     */
    dropTable(tableName: string): Promise<void>;
    /**
     * Checks if column with the given name exist in the given table.
     */
    hasColumn(tableName: string, columnName: string): Promise<boolean>;
    /**
     * Creates a new column from the column in the table.
     */
    addColumn(tableOrName: Table | string, column: TableColumn): Promise<void>;
    /**
     * Creates a new columns from the column in the table.
     */
    addColumns(tableOrName: Table | string, columns: TableColumn[]): Promise<void>;
    /**
     * Renames column in the given table.
     */
    renameColumn(tableOrName: Table | string, oldTableColumnOrName: TableColumn | string, newTableColumnOrName: TableColumn | string): Promise<void>;
    /**
     * Changes a column in the table.
     */
    changeColumn(tableOrName: Table | string, oldTableColumnOrName: TableColumn | string, newColumn: TableColumn): Promise<void>;
    /**
     * Changes a column in the table.
     * Changed column looses all its keys in the db.
     */
    changeColumns(table: Table, changedColumns: {
        newColumn: TableColumn;
        oldColumn: TableColumn;
    }[]): Promise<void>;
    /**
     * Drops column in the table.
     */
    dropColumn(table: Table, column: TableColumn): Promise<void>;
    /**
     * Drops the columns in the table.
     */
    dropColumns(table: Table, columns: TableColumn[]): Promise<void>;
    /**
     * Updates table's primary keys.
     */
    updatePrimaryKeys(dbTable: Table): Promise<void>;
    /**
     * Creates a new foreign key.
     */
    createForeignKey(tableOrName: Table | string, foreignKey: TableForeignKey): Promise<void>;
    /**
     * Creates a new foreign keys.
     */
    createForeignKeys(tableOrName: Table | string, foreignKeys: TableForeignKey[]): Promise<void>;
    /**
     * Drops a foreign key from the table.
     */
    dropForeignKey(tableOrName: Table | string, foreignKey: TableForeignKey): Promise<void>;
    /**
     * Drops a foreign keys from the table.
     */
    dropForeignKeys(tableOrName: Table | string, foreignKeys: TableForeignKey[]): Promise<void>;
    /**
     * Creates a new index.
     */
    createIndex(table: Table | string, index: TableIndex): Promise<void>;
    /**
     * Drops an index from the table.
     */
    dropIndex(tableSchemeOrName: Table | string, indexName: string): Promise<void>;
    /**
     * Truncates table.
     */
    truncate(tableName: string): Promise<void>;
    /**
     * Removes all tables from the currently connected database.
     */
    clearDatabase(): Promise<void>;
    /**
     * Enables special query runner mode in which sql queries won't be executed,
     * instead they will be memorized into a special variable inside query runner.
     * You can get memorized sql using getMemorySql() method.
     */
    enableSqlMemory(): void;
    /**
     * Disables special query runner mode in which sql queries won't be executed
     * started by calling enableSqlMemory() method.
     *
     * Previously memorized sql will be flushed.
     */
    disableSqlMemory(): void;
    /**
     * Gets sql stored in the memory. Parameters in the sql are already replaced.
     */
    getMemorySql(): (string | {
        up: string;
        down: string;
    })[];
    /**
     * Parametrizes given object of values. Used to create column=value queries.
     */
    protected parametrize(objectLiteral: ObjectLiteral, startIndex?: number): string[];
    /**
     * Builds a query for create column.
     */
    protected buildCreateColumnSql(column: TableColumn): string;
    protected recreateTable(table: Table, oldTableSchema?: Table, migrateData?: boolean): Promise<void>;
    /**
     * If given value is a table name then it loads its table schema representation from the database.
     */
    protected getTableSchema(tableOrName: Table | string): Promise<Table>;
}
