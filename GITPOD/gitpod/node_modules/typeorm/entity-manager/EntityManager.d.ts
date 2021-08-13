import { Connection } from "../connection/Connection";
import { FindManyOptions } from "../find-options/FindManyOptions";
import { ObjectType } from "../common/ObjectType";
import { FindOneOptions } from "../find-options/FindOneOptions";
import { DeepPartial } from "../common/DeepPartial";
import { RemoveOptions } from "../repository/RemoveOptions";
import { SaveOptions } from "../repository/SaveOptions";
import { MongoRepository } from "../repository/MongoRepository";
import { TreeRepository } from "../repository/TreeRepository";
import { Repository } from "../repository/Repository";
import { QueryRunner } from "../query-runner/QueryRunner";
import { SelectQueryBuilder } from "../query-builder/SelectQueryBuilder";
import { EntityMetadata } from "../metadata/EntityMetadata";
import { QueryPartialEntity } from "../query-builder/QueryPartialEntity";
/**
 * Entity manager supposed to work with any entity, automatically find its repository and call its methods,
 * whatever entity type are you passing.
 */
export declare class EntityManager {
    /**
     * Connection used by this entity manager.
     */
    readonly connection: Connection;
    /**
     * Custom query runner to be used for operations in this entity manager.
     * Used only in non-global entity manager.
     */
    readonly queryRunner?: QueryRunner;
    /**
     * Once created and then reused by en repositories.
     */
    protected repositories: Repository<any>[];
    constructor(connection: Connection, queryRunner?: QueryRunner);
    /**
     * Wraps given function execution (and all operations made there) in a transaction.
     * All database operations must be executed using provided entity manager.
     */
    transaction<T>(runInTransaction: (entityManger: EntityManager) => Promise<T>): Promise<T>;
    /**
     * Executes raw SQL query and returns raw database results.
     */
    query(query: string, parameters?: any[]): Promise<any>;
    /**
     * Creates a new query builder that can be used to build a sql query.
     */
    createQueryBuilder<Entity>(entityClass: ObjectType<Entity> | Function | string, alias: string, queryRunner?: QueryRunner): SelectQueryBuilder<Entity>;
    /**
     * Creates a new query builder that can be used to build a sql query.
     */
    createQueryBuilder(queryRunner?: QueryRunner): SelectQueryBuilder<any>;
    /**
     * Checks if entity has an id.
     */
    hasId(entity: any): boolean;
    /**
     * Checks if entity of given schema name has an id.
     */
    hasId(target: Function | string, entity: any): boolean;
    /**
     * Gets entity mixed id.
     */
    getId(entity: any): any;
    /**
     * Gets entity mixed id.
     */
    getId(target: Function | string, entity: any): any;
    /**
     * Creates a new entity instance.
     */
    create<Entity>(entityClass: ObjectType<Entity>): Entity;
    /**
     * Creates a new entity instance and copies all entity properties from this object into a new entity.
     * Note that it copies only properties that present in entity schema.
     */
    create<Entity>(entityClass: ObjectType<Entity> | string, plainObject: DeepPartial<Entity>): Entity;
    /**
     * Creates a new entities and copies all entity properties from given objects into their new entities.
     * Note that it copies only properties that present in entity schema.
     */
    create<Entity>(entityClass: ObjectType<Entity> | string, plainObjects: DeepPartial<Entity>[]): Entity[];
    /**
     * Merges two entities into one new entity.
     */
    merge<Entity>(entityClass: ObjectType<Entity> | string, mergeIntoEntity: Entity, ...entityLikes: DeepPartial<Entity>[]): Entity;
    /**
     * Creates a new entity from the given plan javascript object. If entity already exist in the database, then
     * it loads it (and everything related to it), replaces all values with the new ones from the given object
     * and returns this new entity. This new entity is actually a loaded from the db entity with all properties
     * replaced from the new object.
     */
    preload<Entity>(entityClass: ObjectType<Entity> | string, entityLike: DeepPartial<Entity>): Promise<Entity | undefined>;
    /**
     * Saves all given entities in the database.
     * If entities do not exist in the database then inserts, otherwise updates.
     */
    save<Entity>(entity: Entity, options?: SaveOptions): Promise<Entity>;
    /**
     * Saves all given entities in the database.
     * If entities do not exist in the database then inserts, otherwise updates.
     */
    save<Entity, T extends DeepPartial<Entity>>(targetOrEntity: ObjectType<Entity> | string, entity: T, options?: SaveOptions): Promise<T>;
    /**
     * Saves all given entities in the database.
     * If entities do not exist in the database then inserts, otherwise updates.
     */
    save<Entity>(entities: Entity[], options?: SaveOptions): Promise<Entity[]>;
    /**
     * Saves all given entities in the database.
     * If entities do not exist in the database then inserts, otherwise updates.
     */
    save<Entity, T extends DeepPartial<Entity>>(targetOrEntity: ObjectType<Entity> | string, entities: T[], options?: SaveOptions): Promise<T[]>;
    /**
     * Inserts a given entity into the database.
     * Unlike save method executes a primitive operation without cascades, relations and other operations included.
     * Does not modify source entity and does not execute listeners and subscribers.
     * Executes fast and efficient INSERT query.
     * Does not check if entity exist in the database, so query will fail if duplicate entity is being inserted.
     * You can execute bulk inserts using this method.
     */
    insert<Entity>(target: ObjectType<Entity> | string, entity: QueryPartialEntity<Entity> | QueryPartialEntity<Entity>[], options?: SaveOptions): Promise<void>;
    /**
     * Updates entity partially. Entity can be found by a given conditions.
     * Unlike save method executes a primitive operation without cascades, relations and other operations included.
     * Does not modify source entity and does not execute listeners and subscribers.
     * Executes fast and efficient UPDATE query.
     * Does not check if entity exist in the database.
     */
    update<Entity>(target: ObjectType<Entity> | string, conditions: Partial<Entity>, partialEntity: DeepPartial<Entity>, options?: SaveOptions): Promise<void>;
    /**
     * Updates entity partially. Entity will be found by a given id.
     * Unlike save method executes a primitive operation without cascades, relations and other operations included.
     * Does not modify source entity and does not execute listeners and subscribers.
     * Executes fast and efficient UPDATE query.
     * Does not check if entity exist in the database.
     */
    updateById<Entity>(target: ObjectType<Entity> | string, id: any | any[], partialEntity: DeepPartial<Entity>, options?: SaveOptions): Promise<void>;
    /**
     * Removes a given entity from the database.
     */
    remove<Entity>(entity: Entity): Promise<Entity>;
    /**
     * Removes a given entity from the database.
     */
    remove<Entity>(targetOrEntity: ObjectType<Entity> | string, entity: Entity, options?: RemoveOptions): Promise<Entity>;
    /**
     * Removes a given entity from the database.
     */
    remove<Entity>(entity: Entity[], options?: RemoveOptions): Promise<Entity>;
    /**
     * Removes a given entity from the database.
     */
    remove<Entity>(targetOrEntity: ObjectType<Entity> | string, entity: Entity[], options?: RemoveOptions): Promise<Entity[]>;
    /**
     * Deletes entities by a given conditions.
     * Unlike save method executes a primitive operation without cascades, relations and other operations included.
     * Does not modify source entity and does not execute listeners and subscribers.
     * Executes fast and efficient DELETE query.
     * Does not check if entity exist in the database.
     */
    delete<Entity>(targetOrEntity: ObjectType<Entity> | string, conditions: Partial<Entity>, options?: RemoveOptions): Promise<void>;
    /**
     * Deletes entities by a given entity id or ids.
     * Unlike save method executes a primitive operation without cascades, relations and other operations included.
     * Does not modify source entity and does not execute listeners and subscribers.
     * Executes fast and efficient DELETE query.
     * Does not check if entity exist in the database.
     */
    deleteById<Entity>(targetOrEntity: ObjectType<Entity> | string, id: any | any[], options?: RemoveOptions): Promise<void>;
    /**
     * Deletes entity by a given entity id.
     *
     * @deprecated use deleteById method instead.
     */
    removeById<Entity>(targetOrEntity: ObjectType<Entity> | string, id: any, options?: RemoveOptions): Promise<void>;
    /**
     * Deletes entity by a given entity ids.
     *
     * @deprecated use deleteById method instead.
     */
    removeByIds<Entity>(targetOrEntity: ObjectType<Entity> | string, ids: any[], options?: RemoveOptions): Promise<void>;
    /**
     * Counts entities that match given options.
     * Useful for pagination.
     */
    count<Entity>(entityClass: ObjectType<Entity> | string, options?: FindManyOptions<Entity>): Promise<number>;
    /**
     * Counts entities that match given conditions.
     * Useful for pagination.
     */
    count<Entity>(entityClass: ObjectType<Entity> | string, conditions?: Partial<Entity>): Promise<number>;
    /**
     * Finds entities that match given options.
     */
    find<Entity>(entityClass: ObjectType<Entity> | string, options?: FindManyOptions<Entity>): Promise<Entity[]>;
    /**
     * Finds entities that match given conditions.
     */
    find<Entity>(entityClass: ObjectType<Entity> | string, conditions?: Partial<Entity>): Promise<Entity[]>;
    /**
     * Finds entities that match given find options.
     * Also counts all entities that match given conditions,
     * but ignores pagination settings (from and take options).
     */
    findAndCount<Entity>(entityClass: ObjectType<Entity> | string, options?: FindManyOptions<Entity>): Promise<[Entity[], number]>;
    /**
     * Finds entities that match given conditions.
     * Also counts all entities that match given conditions,
     * but ignores pagination settings (from and take options).
     */
    findAndCount<Entity>(entityClass: ObjectType<Entity> | string, conditions?: Partial<Entity>): Promise<[Entity[], number]>;
    /**
     * Finds entities with ids.
     * Optionally find options can be applied.
     */
    findByIds<Entity>(entityClass: ObjectType<Entity> | string, ids: any[], options?: FindManyOptions<Entity>): Promise<Entity[]>;
    /**
     * Finds entities with ids.
     * Optionally conditions can be applied.
     */
    findByIds<Entity>(entityClass: ObjectType<Entity> | string, ids: any[], conditions?: Partial<Entity>): Promise<Entity[]>;
    /**
     * Finds first entity that matches given find options.
     */
    findOne<Entity>(entityClass: ObjectType<Entity> | string, options?: FindOneOptions<Entity>): Promise<Entity | undefined>;
    /**
     * Finds first entity that matches given conditions.
     */
    findOne<Entity>(entityClass: ObjectType<Entity> | string, conditions?: Partial<Entity>): Promise<Entity | undefined>;
    /**
     * Finds entity with given id.
     * Optionally find options can be applied.
     */
    findOneById<Entity>(entityClass: ObjectType<Entity> | string, id: any, options?: FindOneOptions<Entity>): Promise<Entity | undefined>;
    /**
     * Finds entity with given id.
     * Optionally conditions can be applied.
     */
    findOneById<Entity>(entityClass: ObjectType<Entity> | string, id: any, conditions?: Partial<Entity>): Promise<Entity | undefined>;
    /**
     * Clears all the data from the given table (truncates/drops it).
     *
     * Note: this method uses TRUNCATE and may not work as you expect in transactions on some platforms.
     * @see https://stackoverflow.com/a/5972738/925151
     */
    clear<Entity>(entityClass: ObjectType<Entity> | string): Promise<void>;
    /**
     * Gets repository for the given entity class or name.
     * If single database connection mode is used, then repository is obtained from the
     * repository aggregator, where each repository is individually created for this entity manager.
     * When single database connection is not used, repository is being obtained from the connection.
     */
    getRepository<Entity>(target: ObjectType<Entity> | string): Repository<Entity>;
    /**
     * Gets tree repository for the given entity class or name.
     * If single database connection mode is used, then repository is obtained from the
     * repository aggregator, where each repository is individually created for this entity manager.
     * When single database connection is not used, repository is being obtained from the connection.
     */
    getTreeRepository<Entity>(target: ObjectType<Entity> | string): TreeRepository<Entity>;
    /**
     * Gets mongodb repository for the given entity class.
     */
    getMongoRepository<Entity>(entityClass: ObjectType<Entity>): MongoRepository<Entity>;
    /**
     * Gets mongodb repository for the given entity name.
     */
    getMongoRepository<Entity>(entityName: string): MongoRepository<Entity>;
    /**
     * Gets custom entity repository marked with @EntityRepository decorator.
     */
    getCustomRepository<T>(customRepository: ObjectType<T>): T;
    /**
     * Releases all resources used by entity manager.
     * This is used when entity manager is created with a single query runner,
     * and this single query runner needs to be released after job with entity manager is done.
     */
    release(): Promise<void>;
    /**
     * Joins all eager relations recursively.
     */
    protected joinEagerRelations(qb: SelectQueryBuilder<any>, alias: string, metadata: EntityMetadata): void;
}
