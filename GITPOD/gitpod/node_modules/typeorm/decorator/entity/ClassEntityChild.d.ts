import { EntityOptions } from "../options/EntityOptions";
/**
 * Special type of the entity used in the class-table inherited tables.
 */
export declare function ClassEntityChild(tableName?: string, options?: EntityOptions): (target: Function) => void;
