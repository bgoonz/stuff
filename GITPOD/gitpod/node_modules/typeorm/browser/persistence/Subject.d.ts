import { ObjectLiteral } from "../common/ObjectLiteral";
import { EntityMetadata } from "../metadata/EntityMetadata";
import { ColumnMetadata } from "../metadata/ColumnMetadata";
import { RelationMetadata } from "../metadata/RelationMetadata";
/**
 * Holds information about insert operation into junction table.
 */
export interface JunctionInsert {
    /**
     * Relation of the junction table.
     */
    relation: RelationMetadata;
    /**
     * Entities that needs to be "bind" to the subject.
     */
    junctionEntities: ObjectLiteral[];
}
/**
 * Holds information about remove operation from the junction table.
 */
export interface JunctionRemove {
    /**
     * Relation of the junction table.
     */
    relation: RelationMetadata;
    /**
     * Entity ids that needs to be removed from the junction table.
     */
    junctionRelationIds: any[];
}
/**
 * Holds information about relation update in some subject.
 */
export interface RelationUpdate {
    /**
     * Relation that needs to be updated.
     */
    relation: RelationMetadata;
    /**
     * New value that needs to be set into into new relation.
     */
    value: any;
}
/**
 * Subject is a subject of persistence.
 * It holds information about each entity that needs to be persisted:
 * - what entity should be persisted
 * - what is database representation of the persisted entity
 * - what entity metadata of the persisted entity
 * - what is allowed to with persisted entity (insert/update/remove)
 *
 * Having this collection of subjects we can perform database queries.
 */
export declare class Subject {
    /**
     * Persist entity (changed entity).
     */
    private _persistEntity?;
    /**
     * Database entity.
     */
    private _databaseEntity?;
    /**
     * Entity metadata of the subject entity.
     */
    readonly metadata: EntityMetadata;
    /**
     * Date when this entity is persisted.
     */
    readonly date: Date;
    /**
     * Indicates if this subject can be inserted into the database.
     * This means that this subject either is newly persisted, either can be inserted by cascades.
     */
    canBeInserted: boolean;
    /**
     * Indicates if this subject can be updated in the database.
     * This means that this subject either was persisted, either can be updated by cascades.
     */
    canBeUpdated: boolean;
    /**
     * Indicates if this subject MUST be removed from the database.
     * This means that this subject either was removed, either was removed by cascades.
     */
    mustBeRemoved: boolean;
    /**
     * Differentiated columns between persisted and database entities.
     */
    diffColumns: ColumnMetadata[];
    /**
     * Differentiated relations between persisted and database entities.
     */
    diffRelations: RelationMetadata[];
    /**
     * List of relations which need to be unset.
     * This is used to update relation from inverse side.
     */
    relationUpdates: RelationUpdate[];
    /**
     * Records that needs to be inserted into the junction tables of this subject.
     */
    junctionInserts: JunctionInsert[];
    /**
     * Records that needs to be removed from the junction tables of this subject.
     */
    junctionRemoves: JunctionRemove[];
    /**
     * When subject is newly persisted it may have a generated entity id.
     * In this case it should be written here.
     */
    generatedMap?: ObjectLiteral;
    /**
     * Generated id of the parent entity. Used in the class-table-inheritance.
     */
    parentGeneratedId?: any;
    /**
     * Used in newly persisted entities which are tree tables.
     */
    treeLevel?: number;
    constructor(metadata: EntityMetadata, entity?: ObjectLiteral, databaseEntity?: ObjectLiteral);
    /**
     * Gets entity sent to the persistence (e.g. changed entity).
     * Throws error if persisted entity was not set.
     */
    readonly entity: ObjectLiteral;
    /**
     * Checks if subject has a persisted entity.
     */
    readonly hasEntity: boolean;
    /**
     * Gets entity from the database (e.g. original entity).
     * THIS IS NOT RAW ENTITY DATA.
     * Throws error if database entity was not set.
     */
    /**
     * Sets entity from the database (e.g. original entity).
     * Once database entity set it calculates differentiated columns and relations
     * between persistent entity and database entity.
     */
    databaseEntity: ObjectLiteral;
    /**
     * Checks if subject has a database entity.
     */
    readonly hasDatabaseEntity: boolean;
    /**
     * Gets entity target from the entity metadata of this subject.
     */
    readonly entityTarget: Function | string;
    /**
     * Checks if this subject must be inserted into the database.
     * Subject can be inserted into the database if it is allowed to be inserted (explicitly persisted or by cascades)
     * and if it does not have database entity set.
     */
    readonly mustBeInserted: boolean;
    /**
     * Checks if this subject must be updated into the database.
     * Subject can be updated in the database if it is allowed to be updated (explicitly persisted or by cascades)
     * and if it does have differentiated columns or relations.
     */
    readonly mustBeUpdated: boolean;
    /**
     * Checks if this subject has relations to be updated.
     */
    readonly hasRelationUpdates: boolean;
    /**
     * Gets id of the persisted entity.
     * If entity is not set then it returns undefined.
     * If entity itself has an id then it simply returns it.
     * If entity does not have an id then it returns newly generated id.

    get getPersistedEntityIdMap(): any|undefined {
        if (!this.hasEntity)
            return undefined;

        const entityIdMap = this.metadata.getDatabaseEntityIdMap(this.entity);
        if (entityIdMap)
            return entityIdMap;

        if (this.newlyGeneratedId)
            return this.metadata.createSimpleDatabaseIdMap(this.newlyGeneratedId);

        return undefined;
    }*/
    /**
     * Validates this subject for errors.
     * Subject cannot be at the same time inserted and updated, removed and inserted, removed and updated.
     */
    validate(): void;
    /**
     * Performs entity re-computations.
     */
    recompute(): void;
    /**
     * Differentiate columns from the updated entity and entity stored in the database.
     */
    protected computeDiffColumns(): void;
    /**
     * Difference columns of the owning one-to-one and many-to-one columns.
     */
    protected computeDiffRelationalColumns(): void;
}
