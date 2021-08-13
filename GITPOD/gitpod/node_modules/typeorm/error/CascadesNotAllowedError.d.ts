import { EntityMetadata } from "../metadata/EntityMetadata";
import { RelationMetadata } from "../metadata/RelationMetadata";
/**
 */
export declare class CascadesNotAllowedError extends Error {
    name: string;
    constructor(type: "insert" | "update" | "remove", metadata: EntityMetadata, relation: RelationMetadata);
}
