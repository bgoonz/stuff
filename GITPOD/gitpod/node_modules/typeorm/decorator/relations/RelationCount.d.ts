import { SelectQueryBuilder } from "../../query-builder/SelectQueryBuilder";
/**
 * Holds a number of children in the closure table of the column.
 */
export declare function RelationCount<T>(relation: string | ((object: T) => any), alias?: string, queryBuilderFactory?: (qb: SelectQueryBuilder<any>) => SelectQueryBuilder<any>): Function;
