import { getConnection } from "../index";
/**
 * Base abstract entity for all entities, used in ActiveRecord patterns.
 */
var BaseEntity = /** @class */ (function () {
    function BaseEntity() {
    }
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    /**
     * Checks if entity has an id.
     * If entity composite compose ids, it will check them all.
     */
    BaseEntity.prototype.hasId = function () {
        return this.constructor.getRepository().hasId(this);
    };
    /**
     * Saves current entity in the database.
     * If entity does not exist in the database then inserts, otherwise updates.
     */
    BaseEntity.prototype.save = function () {
        return this.constructor.getRepository().save(this);
    };
    /**
     * Removes current entity from the database.
     */
    BaseEntity.prototype.remove = function () {
        return this.constructor.getRepository().remove(this);
    };
    // -------------------------------------------------------------------------
    // Public Static Methods
    // -------------------------------------------------------------------------
    /**
     * Sets connection to be used by entity.
     */
    BaseEntity.useConnection = function (connection) {
        this.usedConnection = connection;
    };
    /**
     * Gets current entity's Repository.
     */
    BaseEntity.getRepository = function () {
        var connection = this.usedConnection || getConnection();
        return connection.getRepository(this);
    };
    Object.defineProperty(BaseEntity, "target", {
        /**
         * Returns object that is managed by this repository.
         * If this repository manages entity from schema,
         * then it returns a name of that schema instead.
         */
        get: function () {
            return this.getRepository().target;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Checks entity has an id.
     * If entity composite compose ids, it will check them all.
     */
    BaseEntity.hasId = function (entity) {
        return this.getRepository().hasId(entity);
    };
    /**
     * Gets entity mixed id.
     */
    BaseEntity.getId = function (entity) {
        return this.getRepository().getId(entity);
    };
    /**
     * Creates a new query builder that can be used to build a sql query.
     */
    BaseEntity.createQueryBuilder = function (alias) {
        return this.getRepository().createQueryBuilder(alias);
    };
    /**
     * Creates a new entity instance and copies all entity properties from this object into a new entity.
     * Note that it copies only properties that present in entity schema.
     */
    BaseEntity.create = function (entityOrEntities) {
        return this.getRepository().create(entityOrEntities);
    };
    /**
     * Merges multiple entities (or entity-like objects) into a given entity.
     */
    BaseEntity.merge = function (mergeIntoEntity) {
        var entityLikes = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            entityLikes[_i - 1] = arguments[_i];
        }
        return (_a = this.getRepository()).merge.apply(_a, [mergeIntoEntity].concat(entityLikes));
        var _a;
    };
    /**
     * Creates a new entity from the given plan javascript object. If entity already exist in the database, then
     * it loads it (and everything related to it), replaces all values with the new ones from the given object
     * and returns this new entity. This new entity is actually a loaded from the db entity with all properties
     * replaced from the new object.
     *
     * Note that given entity-like object must have an entity id / primary key to find entity by.
     * Returns undefined if entity with given id was not found.
     */
    BaseEntity.preload = function (entityLike) {
        return this.getRepository().preload(entityLike);
    };
    /**
     * Saves one or many given entities.
     */
    BaseEntity.save = function (entityOrEntities, options) {
        return this.getRepository().save(entityOrEntities, options);
    };
    /**
     * Updates entity partially. Entity can be found by a given conditions.
     */
    BaseEntity.update = function (conditionsOrFindOptions, partialEntity, options) {
        return this.getRepository().update(conditionsOrFindOptions, partialEntity, options);
    };
    /**
     * Updates entity partially. Entity will be found by a given id.
     */
    BaseEntity.updateById = function (id, partialEntity, options) {
        return this.getRepository().updateById(id, partialEntity, options);
    };
    /**
     * Removes one or many given entities.
     */
    BaseEntity.remove = function (entityOrEntities, options) {
        return this.getRepository().remove(entityOrEntities, options);
    };
    /**
     * Removes entity by a given entity id.
     */
    BaseEntity.removeById = function (id, options) {
        return this.getRepository().deleteById(id, options);
    };
    /**
     * Counts entities that match given find options or conditions.
     */
    BaseEntity.count = function (optionsOrConditions) {
        return this.getRepository().count(optionsOrConditions);
    };
    /**
     * Finds entities that match given find options or conditions.
     */
    BaseEntity.find = function (optionsOrConditions) {
        return this.getRepository().find(optionsOrConditions);
    };
    /**
     * Finds entities that match given find options or conditions.
     * Also counts all entities that match given conditions,
     * but ignores pagination settings (from and take options).
     */
    BaseEntity.findAndCount = function (optionsOrConditions) {
        return this.getRepository().findAndCount(optionsOrConditions);
    };
    /**
     * Finds entities by ids.
     * Optionally find options can be applied.
     */
    BaseEntity.findByIds = function (ids, optionsOrConditions) {
        return this.getRepository().findByIds(ids, optionsOrConditions);
    };
    /**
     * Finds first entity that matches given conditions.
     */
    BaseEntity.findOne = function (optionsOrConditions) {
        return this.getRepository().findOne(optionsOrConditions);
    };
    /**
     * Finds entity by given id.
     * Optionally find options or conditions can be applied.
     */
    BaseEntity.findOneById = function (id, optionsOrConditions) {
        return this.getRepository().findOneById(id, optionsOrConditions);
    };
    /**
     * Executes a raw SQL query and returns a raw database results.
     * Raw query execution is supported only by relational databases (MongoDB is not supported).
     */
    BaseEntity.query = function (query, parameters) {
        return this.getRepository().query(query, parameters);
    };
    /**
     * Clears all the data from the given table/collection (truncates/drops it).
     */
    BaseEntity.clear = function () {
        return this.getRepository().clear();
    };
    return BaseEntity;
}());
export { BaseEntity };

//# sourceMappingURL=BaseEntity.js.map
