import { RelationMetadata } from "../metadata/RelationMetadata";
import { Connection } from "../connection/Connection";
import { ObjectLiteral } from "../common/ObjectLiteral";
/**
 * Wraps entities and creates getters/setters for their relations
 * to be able to lazily load relations when accessing these relations.
 */
export declare class LazyRelationsWrapper {
    private connection;
    constructor(connection: Connection);
    /**
     * Wraps given entity and creates getters/setters for its given relation
     * to be able to lazily load data when accessing these relation.
     */
    wrap(object: ObjectLiteral, relation: RelationMetadata): void;
}
