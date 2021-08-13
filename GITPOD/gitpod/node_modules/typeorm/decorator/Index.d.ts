import { IndexOptions } from "./options/IndexOptions";
/**
 * Composite index must be set on entity classes and must specify entity's fields to be indexed.
 */
export declare function Index(options?: IndexOptions): Function;
/**
 * Composite index must be set on entity classes and must specify entity's fields to be indexed.
 */
export declare function Index(name: string, options?: IndexOptions): Function;
/**
 * Composite index must be set on entity classes and must specify entity's fields to be indexed.
 */
export declare function Index(name: string, fields: string[], options?: IndexOptions): Function;
/**
 * Composite index must be set on entity classes and must specify entity's fields to be indexed.
 */
export declare function Index(fields: string[], options?: IndexOptions): Function;
/**
 * Composite index must be set on entity classes and must specify entity's fields to be indexed.
 */
export declare function Index(fields: (object?: any) => (any[] | {
    [key: string]: number;
}), options?: IndexOptions): Function;
/**
 * Composite index must be set on entity classes and must specify entity's fields to be indexed.
 */
export declare function Index(name: string, fields: (object?: any) => (any[] | {
    [key: string]: number;
}), options?: IndexOptions): Function;
