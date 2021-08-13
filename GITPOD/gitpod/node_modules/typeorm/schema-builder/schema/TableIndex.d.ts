import { IndexMetadata } from "../../metadata/IndexMetadata";
/**
 * Database's table index stored in this class.
 */
export declare class TableIndex {
    /**
     * Table name that contains this unique index.
     */
    tableName: string;
    /**
     * Index name.
     */
    name: string;
    /**
     * Columns included in this index.
     */
    columnNames: string[];
    /**
     * Indicates if this index is unique.
     */
    isUnique: boolean;
    constructor(tableName: string, name: string, columnNames: string[], isUnique: boolean);
    /**
     * Creates a new copy of this index with exactly same properties.
     */
    clone(): TableIndex;
    /**
     * Creates index from the index metadata object.
     */
    static create(indexMetadata: IndexMetadata): TableIndex;
}
