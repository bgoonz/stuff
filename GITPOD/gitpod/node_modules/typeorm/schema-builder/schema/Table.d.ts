import { TableColumn } from "./TableColumn";
import { TableIndex } from "./TableIndex";
import { TableForeignKey } from "./TableForeignKey";
import { TablePrimaryKey } from "./TablePrimaryKey";
import { ColumnMetadata } from "../../metadata/ColumnMetadata";
import { ObjectLiteral } from "../../common/ObjectLiteral";
import { EntityMetadata } from "../../metadata/EntityMetadata";
import { Driver } from "../../driver/Driver";
/**
 * Table in the database represented in this class.
 */
export declare class Table {
    /**
     * Table name.
     */
    name: string;
    /**
     * Table columns.
     */
    columns: TableColumn[];
    /**
     * Table indices.
     */
    indices: TableIndex[];
    /**
     * Table foreign keys.
     */
    foreignKeys: TableForeignKey[];
    /**
     * Table primary keys.
     */
    primaryKeys: TablePrimaryKey[];
    /**
     * Indicates if table was just created.
     * This is needed, for example to check if we need to skip primary keys creation
     * for new tables.
     */
    justCreated: boolean;
    /**
     * Table engine.
     */
    engine?: string;
    /**
     * Database name.
     */
    database?: string;
    /**
     * Schema name. Used in Postgres and Sql Server.
     */
    schema?: string;
    constructor(name: string, columns?: TableColumn[] | ObjectLiteral[], justCreated?: boolean, engine?: string, database?: string, schema?: string);
    /**
     * Gets only those primary keys that does not
     */
    readonly primaryKeysWithoutGenerated: TablePrimaryKey[];
    readonly hasGeneratedColumn: boolean;
    /**
     * Clones this table to a new table with all properties cloned.
     */
    clone(): Table;
    /**
     * Adds columns.
     */
    addColumns(columns: TableColumn[]): void;
    /**
     * Replaces given column.
     */
    replaceColumn(oldColumn: TableColumn, newColumn: TableColumn): void;
    /**
     * Removes a columns from this table.
     */
    removeColumn(columnToRemove: TableColumn): void;
    /**
     * Remove all columns from this table.
     */
    removeColumns(columns: TableColumn[]): void;
    /**
     * Adds all given primary keys.
     */
    addPrimaryKeys(addedKeys: TablePrimaryKey[]): void;
    /**
     * Removes all given primary keys.
     */
    removePrimaryKeys(droppedKeys: TablePrimaryKey[]): void;
    /**
     * Removes primary keys of the given columns.
     */
    removePrimaryKeysOfColumns(columns: TableColumn[]): void;
    /**
     * Adds foreign keys.
     */
    addForeignKeys(foreignKeys: TableForeignKey[]): void;
    /**
     * Removes foreign key from this table.
     */
    removeForeignKey(removedForeignKey: TableForeignKey): void;
    /**
     * Removes all foreign keys from this table.
     */
    removeForeignKeys(dbForeignKeys: TableForeignKey[]): void;
    /**
     * Removes indices from this table.
     */
    removeIndex(tableIndex: TableIndex): void;
    /**
     * Differentiate columns of this table and columns from the given column metadatas columns
     * and returns only changed.
     */
    findChangedColumns(driver: Driver, columnMetadatas: ColumnMetadata[]): TableColumn[];
    findColumnByName(name: string): TableColumn | undefined;
    /**
     * Compare column lengths only if the datatype supports it.
     */
    private compareColumnLengths(driver, tableColumn, columnMetadata);
    /**
     * Checks if "DEFAULT" values in the column metadata and in the database are equal.
     */
    protected compareDefaultValues(columnMetadataValue: string, databaseValue: string): boolean;
    /**
     * Creates table from a given entity metadata.
     *
     * todo: need deeper implementation
     */
    static create(entityMetadata: EntityMetadata, driver: Driver): Table;
}
