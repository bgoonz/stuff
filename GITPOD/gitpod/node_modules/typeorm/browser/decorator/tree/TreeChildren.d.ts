/**
 * Marks a specific property of the class as a children of the tree.
 */
export declare function TreeChildren(options?: {
    cascadeInsert?: boolean;
    cascadeUpdate?: boolean;
    lazy?: boolean;
}): Function;
