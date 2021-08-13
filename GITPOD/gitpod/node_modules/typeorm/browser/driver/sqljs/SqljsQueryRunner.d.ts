import { ObjectLiteral } from "../../common/ObjectLiteral";
import { InsertResult } from "../InsertResult";
import { AbstractSqliteQueryRunner } from "../sqlite-abstract/AbstractSqliteQueryRunner";
import { SqljsDriver } from "./SqljsDriver";
/**
 * Runs queries on a single sqlite database connection.
 *
 * Does not support compose primary keys with autoincrement field.
 * todo: need to throw exception for this case.
 */
export declare class SqljsQueryRunner extends AbstractSqliteQueryRunner {
    /**
     * Database driver used by connection.
     */
    driver: SqljsDriver;
    constructor(driver: SqljsDriver);
    /**
     * Commits transaction.
     * Error will be thrown if transaction was not started.
     */
    commitTransaction(): Promise<void>;
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
     * Updates rows that match given conditions in the given table.
     * Calls AbstractSqliteQueryRunner.update() and runs autoSave if update() was not called in a transaction.
     */
    update(tableName: string, valuesMap: ObjectLiteral, conditions: ObjectLiteral): Promise<void>;
    /**
     * Deletes from the given table by a given conditions.
     * Calls AbstractSqliteQueryRunner.delete() and runs autoSave if delete() was not called in a transaction.
     */
    delete(tableName: string, conditions: ObjectLiteral | string, maybeParameters?: any[]): Promise<void>;
}
