/**
 * Primary key from the database stored in this class.
 */
export declare class TablePrimaryKey {
    /**
     * Key name.
     */
    name: string;
    /**
     * Column to which this primary key is bind.
     */
    columnName: string;
    constructor(name: string, columnName: string);
    /**
     * Creates a new copy of this primary key with exactly same properties.
     */
    clone(): TablePrimaryKey;
}
