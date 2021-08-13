/**
 * Make all properties in T optional
 */
export declare type QueryPartialEntity<T> = {
    [P in keyof T]?: T[P] | (() => string);
};
