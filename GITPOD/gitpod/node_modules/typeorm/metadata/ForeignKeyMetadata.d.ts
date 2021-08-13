import { ColumnMetadata } from "./ColumnMetadata";
import { EntityMetadata } from "./EntityMetadata";
import { NamingStrategyInterface } from "../naming-strategy/NamingStrategyInterface";
import { OnDeleteType } from "./types/OnDeleteType";
/**
 * Contains all information about entity's foreign key.
 */
export declare class ForeignKeyMetadata {
    /**
     * Entity metadata where this foreign key is.
     */
    entityMetadata: EntityMetadata;
    /**
     * Entity metadata which this foreign key references.
     */
    referencedEntityMetadata: EntityMetadata;
    /**
     * Array of columns of this foreign key.
     */
    columns: ColumnMetadata[];
    /**
     * Array of referenced columns.
     */
    referencedColumns: ColumnMetadata[];
    /**
     * What to do with a relation on deletion of the row containing a foreign key.
     */
    onDelete?: OnDeleteType;
    /**
     * Gets the table name to which this foreign key is applied.
     */
    tableName: string;
    /**
     * Gets the table name to which this foreign key is referenced.
     */
    referencedTableName: string;
    /**
     * Gets foreign key name.
     */
    name: string;
    /**
     * Gets array of column names.
     */
    columnNames: string[];
    /**
     * Gets array of referenced column names.
     */
    referencedColumnNames: string[];
    constructor(options: {
        entityMetadata: EntityMetadata;
        referencedEntityMetadata: EntityMetadata;
        namingStrategy?: NamingStrategyInterface;
        columns: ColumnMetadata[];
        referencedColumns: ColumnMetadata[];
        onDelete?: OnDeleteType;
    });
    /**
     * Builds some depend foreign key properties.
     * Must be called after all entity metadatas and their columns are built.
     */
    build(namingStrategy: NamingStrategyInterface): void;
}
