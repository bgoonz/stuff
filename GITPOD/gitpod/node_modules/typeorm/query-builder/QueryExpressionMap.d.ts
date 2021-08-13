import { Alias } from "./Alias";
import { ObjectLiteral } from "../common/ObjectLiteral";
import { OrderByCondition } from "../find-options/OrderByCondition";
import { JoinAttribute } from "./JoinAttribute";
import { RelationIdAttribute } from "./relation-id/RelationIdAttribute";
import { RelationCountAttribute } from "./relation-count/RelationCountAttribute";
import { Connection } from "../connection/Connection";
import { EntityMetadata } from "../metadata/EntityMetadata";
import { SelectQuery } from "./SelectQuery";
import { ColumnMetadata } from "../metadata/ColumnMetadata";
import { RelationMetadata } from "../metadata/RelationMetadata";
import { QueryBuilder } from "./QueryBuilder";
/**
 * Contains all properties of the QueryBuilder that needs to be build a final query.
 */
export declare class QueryExpressionMap {
    protected connection: Connection;
    /**
     * Indicates if QueryBuilder used to select entities and not a raw results.
     */
    queryEntity: boolean;
    /**
     * Main alias is a main selection object selected by QueryBuilder.
     */
    mainAlias?: Alias;
    /**
     * All aliases (including main alias) used in the query.
     */
    aliases: Alias[];
    /**
     * Represents query type. QueryBuilder is able to build SELECT, UPDATE and DELETE queries.
     */
    queryType: "select" | "update" | "delete" | "insert" | "relation";
    /**
     * Data needs to be SELECT-ed.
     */
    selects: SelectQuery[];
    /**
     * FROM-s to be selected.
     */
    /**
     * If update query was used, it needs "update set" - properties which will be updated by this query.
     * If insert query was used, it needs "insert set" - values that needs to be inserted.
     */
    valuesSet?: ObjectLiteral | ObjectLiteral[];
    /**
     * Optional returning (or output) clause for insert, update or delete queries.
     */
    returning: string;
    /**
     * Optional on conflict statement used in insertion query in postgres.
     */
    onConflict: string;
    /**
     * JOIN queries.
     */
    joinAttributes: JoinAttribute[];
    /**
     * RelationId queries.
     */
    relationIdAttributes: RelationIdAttribute[];
    /**
     * Relation count queries.
     */
    relationCountAttributes: RelationCountAttribute[];
    /**
     * WHERE queries.
     */
    wheres: {
        type: "simple" | "and" | "or";
        condition: string;
    }[];
    /**
     * HAVING queries.
     */
    havings: {
        type: "simple" | "and" | "or";
        condition: string;
    }[];
    /**
     * ORDER BY queries.
     */
    orderBys: OrderByCondition;
    /**
     * GROUP BY queries.
     */
    groupBys: string[];
    /**
     * LIMIT query.
     */
    limit?: number;
    /**
     * OFFSET query.
     */
    offset?: number;
    /**
     * Number of rows to skip of result using pagination.
     */
    skip?: number;
    /**
     * Number of rows to take using pagination.
     */
    take?: number;
    /**
     * Locking mode.
     */
    lockMode?: "optimistic" | "pessimistic_read" | "pessimistic_write";
    /**
     * Current version of the entity, used for locking.
     */
    lockVersion?: number | Date;
    /**
     * Parameters used to be escaped in final query.
     */
    parameters: ObjectLiteral;
    /**
     * Indicates if alias, table names and column names will be ecaped by driver, or not.
     *
     * todo: rename to isQuotingDisabled, also think if it should be named "escaping"
     */
    disableEscaping: boolean;
    /**
     * todo: needs more information.
     */
    ignoreParentTablesJoins: boolean;
    /**
     * Indicates if virtual columns should be included in entity result.
     *
     * todo: what to do with it? is it properly used? what about persistence?
     */
    enableRelationIdValues: boolean;
    /**
     * Extra where condition appended to the end of original where conditions with AND keyword.
     * Original condition will be wrapped into brackets.
     */
    extraAppendedAndWhereCondition: string;
    /**
     * Indicates if query builder creates a subquery.
     */
    subQuery: boolean;
    /**
     * If QueryBuilder was created in a subquery mode then its parent QueryBuilder (who created subquery) will be stored here.
     */
    parentQueryBuilder: QueryBuilder<any>;
    /**
     * Indicates if property names are prefixed with alias names during property replacement.
     * By default this is enabled, however we need this because aliases are not supported in UPDATE and DELETE queries,
     * but user can use them in WHERE expressions.
     */
    aliasNamePrefixingEnabled: boolean;
    /**
     * Indicates if query result cache is enabled or not.
     */
    cache: boolean;
    /**
     * Time in milliseconds in which cache will expire.
     * If not set then global caching time will be used.
     */
    cacheDuration: number;
    /**
     * Cache id.
     * Used to identifier your cache queries.
     */
    cacheId: string;
    /**
     * Property path of relation to work with.
     * Used in relational query builder.
     */
    relationPropertyPath: string;
    /**
     * Entity (target) which relations will be updated.
     */
    of: any | any[];
    /**
     * List of columns where data should be inserted.
     * Used in INSERT query.
     */
    insertColumns: string[];
    constructor(connection: Connection);
    /**
     * Get all ORDER BY queries - if order by is specified by user then it uses them,
     * otherwise it uses default entity order by if it was set.
     */
    readonly allOrderBys: OrderByCondition;
    /**
     * Creates a main alias and adds it to the current expression map.
     */
    setMainAlias(alias: Alias): Alias;
    /**
     * Creates a new alias and adds it to the current expression map.
     */
    createAlias(options: {
        type: "from" | "select" | "join" | "other";
        name?: string;
        target?: Function | string;
        tablePath?: string;
        subQuery?: string;
        metadata?: EntityMetadata;
    }): Alias;
    /**
     * Finds alias with the given name.
     * If alias was not found it throw an exception.
     */
    findAliasByName(aliasName: string): Alias;
    findColumnByAliasExpression(aliasExpression: string): ColumnMetadata | undefined;
    /**
     * Gets relation metadata of the relation this query builder works with.
     *
     * todo: add proper exceptions
     */
    readonly relationMetadata: RelationMetadata;
    /**
     * Copies all properties of the current QueryExpressionMap into a new one.
     * Useful when QueryBuilder needs to create a copy of itself.
     */
    clone(): QueryExpressionMap;
}
