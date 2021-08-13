/**
 * Sets what kind of table-inheritance table will use.
 */
export declare function TableInheritance(type: "single-table" | "class-table"): (target: Function) => void;
