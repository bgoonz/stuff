import { EntityMetadata } from "./EntityMetadata";
import { IndexMetadataArgs } from "../metadata-args/IndexMetadataArgs";
import { NamingStrategyInterface } from "../naming-strategy/NamingStrategyInterface";
import { ColumnMetadata } from "./ColumnMetadata";
import { EmbeddedMetadata } from "./EmbeddedMetadata";
/**
 * Index metadata contains all information about table's index.
 */
export declare class IndexMetadata {
    /**
     * Entity metadata of the class to which this index is applied.
     */
    entityMetadata: EntityMetadata;
    /**
     * Embedded metadata if this index was applied on embedded.
     */
    embeddedMetadata?: EmbeddedMetadata;
    /**
     * Indicates if this index must be unique.
     */
    isUnique: boolean;
    /**
     * If true, the index only references documents with the specified field.
     * These indexes use less space but behave differently in some situations (particularly sorts).
     * This option is only supported for mongodb database.
     */
    isSparse?: boolean;
    /**
     * Target class to which metadata is applied.
     */
    target?: Function | string;
    /**
     * Indexed columns.
     */
    columns: ColumnMetadata[];
    /**
     * User specified index name.
     */
    givenName?: string;
    /**
     * User specified column names.
     */
    givenColumnNames?: ((object?: any) => (any[] | {
        [key: string]: number;
    })) | string[];
    /**
     * Final index name.
     * If index name was given by a user then it stores normalized (by naming strategy) givenName.
     * If index name was not given then its generated.
     */
    name: string;
    /**
     * Gets the table name on which index is applied.
     */
    tableName: string;
    /**
     * Map of column names with order set.
     * Used only by MongoDB driver.
     */
    columnNamesWithOrderingMap: {
        [key: string]: number;
    };
    constructor(options: {
        entityMetadata: EntityMetadata;
        embeddedMetadata?: EmbeddedMetadata;
        columns?: ColumnMetadata[];
        args?: IndexMetadataArgs;
    });
    /**
     * Builds some depend index properties.
     * Must be called after all entity metadata's properties map, columns and relations are built.
     */
    build(namingStrategy: NamingStrategyInterface): this;
}
