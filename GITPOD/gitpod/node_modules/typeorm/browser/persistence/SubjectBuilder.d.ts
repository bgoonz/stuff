import { EntityMetadata } from "../metadata/EntityMetadata";
import { ObjectLiteral } from "../common/ObjectLiteral";
import { Connection } from "../connection/Connection";
import { Subject } from "./Subject";
import { QueryRunner } from "../query-runner/QueryRunner";
/**
 * To be able to execute persistence operations we need to load all entities from the database we need.
 * Loading should be efficient - we need to load entities in as few queries as possible + load as less data as we can.
 * This is how we determine which entities needs to be loaded from db:
 *
 * 1. example with cascade updates and inserts:
 *
 * [Y] - means "yes, we load"
 * [N] - means "no, we don't load"
 * in {} braces we specify what cascade options are set between relations
 *
 * if Post is new, author is not set in the post
 *
 * [Y] Post -> {all} // yes because of "update" and "insert" cascades, no because of "remove"
 *   [Y] Author -> {all} // no because author is not set
 *     [Y] Photo -> {all} // no because author and its photo are not set
 *       [Y] Tag -> {all} // no because author and its photo and its tag are not set
 *
 * if Post is new, author is new (or anything else is new)
 * if Post is updated
 * if Post and/or Author are updated
 *
 * [Y] Post -> {all} // yes because of "update" and "insert" cascades, no because of "remove"
 *   [Y] Author -> {all} // yes because of "update" and "insert" cascades, no because of "remove"
 *     [Y] Photo -> {all} // yes because of "update" and "insert" cascades, no because of "remove"
 *       [Y] Tag -> {all} // yes because of "update" and "insert" cascades, no because of "remove"
 *
 * Here we load post, author, photo, tag to check if they are new or not to persist insert or update operation.
 * We load post, author, photo, tag only if they exist in the relation.
 * From these examples we can see that we always load entity relations when it has "update" or "insert" cascades.
 *
 * 2. example with cascade removes
 *
 * if entity is new its remove operations by cascades should not be executed
 * if entity is updated then values that are null or missing in array (not undefined!, undefined means skip - don't do anything) are treated as removed
 * if entity is removed then all its downside relations which has cascade remove should be removed
 *
 * Once we find removed entity - we load it, and every downside entity which has "remove" cascade set.
 *
 * At the end we have all entities we need to operate with.
 * Next step is to store all loaded entities to manipulate them efficiently.
 *
 * Rules of updating by cascades.
 * Insert operation can lead to:
 *  - insert operations
 *  - update operations
 * Update operation can lead to:
 *  - insert operations
 *  - update operations
 *  - remove operations
 * Remove operation can lead to:
 *  - remove operation
 */
export declare class SubjectBuilder<Entity extends ObjectLiteral> {
    protected connection: Connection;
    protected queryRunner: QueryRunner;
    /**
     * If this gonna be reused then what to do with marked flags?
     * One of solution can be clone this object and reset all marked states for this persistence.
     * Or from reused just extract databaseEntities from their subjects? (looks better)
     */
    operateSubjects: Subject[];
    constructor(connection: Connection, queryRunner: QueryRunner);
    /**
     * Builds operations for entity that is being inserted/updated.
     */
    persist(entity: Entity, metadata: EntityMetadata): Promise<void>;
    /**
     * Builds only remove operations for entity that is being removed.
     */
    remove(entity: Entity, metadata: EntityMetadata): Promise<void>;
    /**
     * Builds and pushes to array of operate entities all entities that we will work with.
     * These are only relational entities which has insert and update cascades.
     * All such entities will be loaded from the database, because they can be inserted or updated.
     * That's why we load them - to understand if they should be inserted or updated, or which columns we need to update.
     * We can't add removed entities here, because to know which entity was removed we need first to
     * load original entity (particularly its id) from the database.
     * That's why we first need to load all changed entities, then extract ids of the removed entities from them,
     * and only then load removed entities by extracted ids.
     */
    protected buildCascadeUpdateAndInsertOperateSubjects(subject: Subject): void;
    /**
     * Builds and pushes to array of operate entities all entities that must be removed.
     */
    protected buildCascadeRemoveOperateSubjects(subject: Subject): void;
    /**
     * Loads database entities for all operate subjects which do not have database entity set.
     * All entities that we load database entities for are marked as updated or inserted.
     * To understand which of them really needs to be inserted or updated we need to load
     * their original representations from the database.
     */
    protected loadOperateSubjectsDatabaseEntities(): Promise<void>;
    /**
     * We need to load removed entity when:
     *  - entity with relations is not new (this can be determined only after entity is loaded from db)
     *      (note: simple "id" check will not work because id can be not generated)
     *  - entity missing relation. When relation is simple
     *      - in the case of one-to-one owner (with join column) relation we need to load owner entity
     *      - in the case of one-to-one (without join column) relation we need to load inverse side entity
     *      - in the case of many-to-one relations we need to load entity itself
     *      - in the case of one-to-many relations we need to load entities by relation from inverse side
     *
     *  Before loading each entity we need to check in the loaded subjects - maybe it was already loaded.
     *
     *  BIG NOTE: objects are being removed by cascades not only when relation is removed, but also when
     *  relation is replaced (e.g. changed with different object).
     */
    protected buildCascadeRemovedAndRelationUpdateOperateSubjects(subject: Subject): Promise<void>;
    /**
     * Builds all junction insert and remove operations used to insert new bind data into junction tables,
     * or remove old junction records.
     * Options specifies which junction operations should be built - insert, remove or both.
     */
    private buildJunctionOperations(options);
    /**
     * Finds subject where entity like given subject's entity.
     * Comparision made by entity id.
     */
    protected findByEntityLike(entityTarget: Function | string, entity: ObjectLiteral): Subject | undefined;
    /**
     * Finds subject where entity like given subject's database entity.
     * Comparision made by entity id.
     */
    protected findByDatabaseEntityLike(entityTarget: Function | string, entity: ObjectLiteral): Subject | undefined;
    /**
     * Groups given Subject objects into groups separated by entity targets.
     */
    protected groupByEntityTargets(): {
        target: Function | string;
        subjects: Subject[];
    }[];
}
