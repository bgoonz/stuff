import { ObjectLiteral } from "../../common/ObjectLiteral";
import { Table } from "../../schema-builder/schema/Table";
import { InsertResult } from "../InsertResult";
import { AbstractSqliteQueryRunner } from "../sqlite-abstract/AbstractSqliteQueryRunner";
import { WebsqlDriver } from "./WebsqlDriver";
/**
 * Runs queries on a single websql database connection.
 */
export declare class WebsqlQueryRunner extends AbstractSqliteQueryRunner {
    /**
     * Real database connection from a connection pool used to perform queries.
     */
    protected databaseConnection: any;
    /**
     * Promise used to obtain a database connection for a first time.
     */
    protected databaseConnectionPromise: Promise<any>;
    /**
     * Database driver used by connection.
     */
    driver: WebsqlDriver;
    constructor(driver: WebsqlDriver);
    /**
     * Creates/uses database connection from the connection pool to perform further operations.
     * Returns obtained database connection.
     */
    connect(): Promise<any>;
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
     * Insert a new row with given values into the given table.
     * Returns value of the generated column if given and generate column exist in the table.
     */
    insert(tableName: string, keyValues: ObjectLiteral): Promise<InsertResult>;
    /**
     * Loads all tables (with given names) from the database and creates a Table from them.
     */
    getTables(tableNames: string[]): Promise<Table[]>;
    /**
     * Removes all tables from the currently connected database.
     */
    clearDatabase(): Promise<void>;
}
