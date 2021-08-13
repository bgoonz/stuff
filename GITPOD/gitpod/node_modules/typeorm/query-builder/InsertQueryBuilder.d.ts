import { QueryBuilder } from "./QueryBuilder";
import { ObjectLiteral } from "../common/ObjectLiteral";
import { ObjectType } from "../common/ObjectType";
import { QueryPartialEntity } from "./QueryPartialEntity";
/**
 * Allows to build complex sql queries in a fashion way and execute those queries.
 */
export declare class InsertQueryBuilder<Entity> extends QueryBuilder<Entity> {
    /**
     * Gets generated sql query without parameters being replaced.
     */
    getQuery(): string;
    /**
     * Optional returning/output clause.
     */
    output(output: string): this;
    /**
     * Specifies INTO which entity's table insertion will be executed.
     */
    into<T>(entityTarget: ObjectType<T> | string, columns?: string[]): InsertQueryBuilder<T>;
    /**
     * Values needs to be inserted into table.
     */
    values(values: QueryPartialEntity<Entity> | QueryPartialEntity<Entity>[]): this;
    /**
     * Optional returning/output clause.
     */
    returning(returning: string): this;
    /**
     * Adds additional ON CONFLICT statement supported in postgres.
     */
    onConflict(statement: string): this;
    /**
     * Creates INSERT express used to perform insert query.
     */
    protected createInsertExpression(): string;
    /**
     * Gets array of values need to be inserted into the target table.
     */
    protected getValueSets(): ObjectLiteral[];
}
