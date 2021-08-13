import { Connection } from "../connection/Connection";
import { QueryRunner } from "../query-runner/QueryRunner";
import { Subject } from "./Subject";
import { EntityManager } from "../entity-manager/EntityManager";
import { Broadcaster } from "../subscriber/Broadcaster";
/**
 * Executes all database operations (inserts, updated, deletes) that must be executed
 * with given persistence subjects.
 */
export declare class SubjectOperationExecutor {
    protected connection: Connection;
    protected transactionEntityManager: EntityManager;
    protected queryRunner: QueryRunner;
    /**
     * All subjects that needs to be operated.
     */
    protected allSubjects: Subject[];
    /**
     * Subjects that must be inserted.
     */
    protected insertSubjects: Subject[];
    /**
     * Subjects that must be updated.
     */
    protected updateSubjects: Subject[];
    /**
     * Subjects that must be removed.
     */
    protected removeSubjects: Subject[];
    /**
     * Subjects which relations should be updated.
     */
    protected relationUpdateSubjects: Subject[];
    protected broadcaster: Broadcaster;
    constructor(connection: Connection, transactionEntityManager: EntityManager, queryRunner: QueryRunner, subjects: Subject[]);
    areExecutableOperations(): boolean;
    /**
     * Executes all operations over given array of subjects.
     * Executes queries using given query runner.
     */
    execute(): Promise<void>;
    /**
     * Executes insert operations.
     *
     * For insertion we separate two groups of entities:
     * - first group of entities are entities which do not have any relations
     *      or entities which do not have any non-nullable relation
     * - second group of entities are entities which does have non-nullable relations
     *
     * Insert process of the entities from the first group which can only have nullable relations are actually a two-step process:
     * - first we insert entities without their relations, explicitly left them NULL
     * - later we update inserted entity once again with id of the object inserted with it
     *
     * Yes, two queries are being executed, but this is by design.
     * There is no better way to solve this problem and others at the same time.
     *
     * Insert process of the entities from the second group which can have only non nullable relations is a single-step process:
     * - we simply insert all entities and get into attention all its dependencies which were inserted in the first group
     */
    private executeInsertOperations();
    /**
     * Inserts an entity from the given insert operation into the database.
     * If entity has an generated column, then after saving new generated value will be stored to the InsertOperation.
     * If entity uses class-table-inheritance, then multiple inserts may by performed to save all entities.
     */
    private insert(subject, alreadyInsertedSubjects);
    private collectColumns(columns, entity, object, operation);
    private collectEmbeds(embed, entity, object, operation);
    /**
     * Collects columns and values for the insert operation.
     */
    private collectColumnsAndValues(metadata, entity, date, parentIdColumnValue, discriminatorValue, alreadyInsertedSubjects, operation);
    /**
     * Inserts all given subjects into closure table.
     */
    private executeInsertClosureTableOperations();
    /**
     * Inserts given subject into closure table.
     */
    private insertClosureTableValues(subject);
    /**
     * Updates all given subjects in the database.
     */
    private executeUpdateOperations();
    /**
     * Updates given subject in the database.
     */
    private update(subject);
    /**
     * Updates relations of all given subjects in the database.
     */
    private executeUpdateRelations();
    /**
     * Updates relations of the given subject in the database.
     */
    private updateRelations(subject);
    /**
     * Removes all given subjects from the database.
     */
    private executeRemoveOperations();
    /**
     * Updates given subject from the database.
     */
    private remove(subject);
    /**
     * Inserts into database junction tables all given array of subjects junction data.
     */
    private executeInsertJunctionsOperations();
    /**
     * Inserts into database junction table given subject's junction insert data.
     */
    private insertJunctions(subject, junctionInsert);
    /**
     * Removes from database junction tables all given array of subjects removal junction data.
     */
    private executeRemoveJunctionsOperations();
    /**
     * Removes from database junction table all given subject's removal junction data.
     */
    private removeJunctions(subject, junctionRemove);
    /**
     * Updates all special columns of the saving entities (create date, update date, versioning).
     */
    private updateSpecialColumnsInPersistedEntities();
}
