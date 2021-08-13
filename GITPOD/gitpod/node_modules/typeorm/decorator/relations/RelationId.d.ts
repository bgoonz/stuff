import { SelectQueryBuilder } from "../../query-builder/SelectQueryBuilder";
/**
 * Special decorator used to extract relation id into separate entity property.
 */
export declare function RelationId<T>(relation: string | ((object: T) => any), alias?: string, queryBuilderFactory?: (qb: SelectQueryBuilder<any>) => SelectQueryBuilder<any>): Function;
