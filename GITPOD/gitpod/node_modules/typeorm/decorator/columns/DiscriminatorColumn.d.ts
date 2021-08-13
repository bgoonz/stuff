import { ColumnType } from "../../driver/types/ColumnTypes";
/**
 * DiscriminatorColumn is a special type column used on entity class (not entity property)
 * and creates a special column which will contain an entity type.
 * This type is required for entities which use single table inheritance pattern.
 */
export declare function DiscriminatorColumn(discriminatorOptions: {
    name: string;
    type: ColumnType;
}): Function;
