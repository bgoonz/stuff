/**
 * Marks a specific property of the class as a parent of the tree.
 */
export declare function TreeParent(options?: {
    cascadeInsert?: boolean;
    cascadeUpdate?: boolean;
    lazy?: boolean;
}): Function;
