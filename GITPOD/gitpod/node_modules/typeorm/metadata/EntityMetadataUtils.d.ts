import { ObjectLiteral } from "../common/ObjectLiteral";
import { EntityMetadata } from "./EntityMetadata";
/**
 * Utils used to work with EntityMetadata objects.
 */
export declare class EntityMetadataUtils {
    /**
     * Creates a property paths for a given entity.
     */
    static createPropertyPath(metadata: EntityMetadata, entity: ObjectLiteral, prefix?: string): string[];
    /**
     * Creates a property paths for a given entity.
     */
    static getPropertyPathValue(entity: ObjectLiteral, propertyPath: string): any;
}
