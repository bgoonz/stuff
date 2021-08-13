import { LazyRelationsWrapper } from "../lazy-loading/LazyRelationsWrapper";
import { OrmUtils } from "../util/OrmUtils";
import { PostgresDriver } from "../driver/postgres/PostgresDriver";
import { SqlServerDriver } from "../driver/sqlserver/SqlServerDriver";
/**
 * Contains all entity metadata.
 */
var EntityMetadata = /** @class */ (function () {
    // ---------------------------------------------------------------------
    // Constructor
    // ---------------------------------------------------------------------
    function EntityMetadata(options) {
        /**
         * Children entity metadatas. Used in inheritance patterns.
         */
        this.childEntityMetadatas = [];
        /**
         * Table type. Tables can be abstract, closure, junction, embedded, etc.
         */
        this.tableType = "regular";
        /**
         * Indicates if this entity metadata of a junction table, or not.
         * Junction table is a table created by many-to-many relationship.
         *
         * Its also possible to understand if entity is junction via tableType.
         */
        this.isJunction = false;
        /**
         * Entity's column metadatas defined by user.
         */
        this.ownColumns = [];
        /**
         * Entity's relation metadatas.
         */
        this.ownRelations = [];
        /**
         * Entity's own listener metadatas.
         */
        this.ownListeners = [];
        /**
         * Entity's own indices.
         */
        this.ownIndices = [];
        /**
         * Relations of the entity, including relations that are coming from the embeddeds of this entity.
         */
        this.relations = [];
        /**
         * List of eager relations this metadata has.
         */
        this.eagerRelations = [];
        /**
         * List of eager relations this metadata has.
         */
        this.lazyRelations = [];
        /**
         * Columns of the entity, including columns that are coming from the embeddeds of this entity.
         */
        this.columns = [];
        /**
         * In the case if this entity metadata is junction table's entity metadata,
         * this will contain all referenced columns of owner entity.
         */
        this.ownerColumns = [];
        /**
         * In the case if this entity metadata is junction table's entity metadata,
         * this will contain all referenced columns of inverse entity.
         */
        this.inverseColumns = [];
        /**
         * Entity's relation id metadatas.
         */
        this.relationIds = [];
        /**
         * Entity's relation id metadatas.
         */
        this.relationCounts = [];
        /**
         * Entity's index metadatas.
         */
        this.indices = [];
        /**
         * Entity's foreign key metadatas.
         */
        this.foreignKeys = [];
        /**
         * Entity's embedded metadatas.
         */
        this.embeddeds = [];
        /**
         * Entity listener metadatas.
         */
        this.listeners = [];
        /**
         * Gets the column with generated flag.
         */
        this.generatedColumns = [];
        /**
         * Gets the primary columns.
         */
        this.primaryColumns = [];
        /**
         * Id columns in the parent table (used in table inheritance).
         */
        this.parentIdColumns = [];
        /**
         * Gets only one-to-one relations of the entity.
         */
        this.oneToOneRelations = [];
        /**
         * Gets only owner one-to-one relations of the entity.
         */
        this.ownerOneToOneRelations = [];
        /**
         * Gets only one-to-many relations of the entity.
         */
        this.oneToManyRelations = [];
        /**
         * Gets only many-to-one relations of the entity.
         */
        this.manyToOneRelations = [];
        /**
         * Gets only many-to-many relations of the entity.
         */
        this.manyToManyRelations = [];
        /**
         * Gets only owner many-to-many relations of the entity.
         */
        this.ownerManyToManyRelations = [];
        /**
         * Gets only owner one-to-one and many-to-one relations.
         */
        this.relationsWithJoinColumns = [];
        var namingStrategy = options.connection.namingStrategy;
        var entityPrefix = options.connection.options.entityPrefix;
        this.lazyRelationsWrapper = new LazyRelationsWrapper(options.connection);
        this.parentClosureEntityMetadata = options.parentClosureEntityMetadata;
        this.target = options.args.target;
        this.tableType = options.args.type;
        this.engine = options.args.engine;
        this.database = options.args.database;
        this.schema = options.args.schema || options.connection.options.schema;
        this.givenTableName = options.args.name;
        this.skipSync = options.args.skipSync || false;
        this.targetName = options.args.target instanceof Function ? options.args.target.name : options.args.target;
        this.tableNameWithoutPrefix = this.tableType === "closure-junction" ? namingStrategy.closureJunctionTableName(this.givenTableName) : namingStrategy.tableName(this.targetName, this.givenTableName);
        this.tableName = entityPrefix ? namingStrategy.prefixTableName(entityPrefix, this.tableNameWithoutPrefix) : this.tableNameWithoutPrefix;
        this.target = this.target ? this.target : this.tableName;
        this.name = this.targetName ? this.targetName : this.tableName;
        this.tablePath = this.buildTablePath(options.connection.driver);
        this.schemaPath = this.buildSchemaPath(options.connection.driver);
        this.isClassTableChild = this.tableType === "class-table-child";
        this.isSingleTableChild = this.tableType === "single-table-child";
        this.isEmbeddable = this.tableType === "embeddable";
        this.isJunction = this.tableType === "closure-junction" || this.tableType === "junction";
        this.isClosureJunction = this.tableType === "closure-junction";
        this.isClosure = this.tableType === "closure";
        this.isAbstract = this.tableType === "abstract";
        this.isRegular = this.tableType === "regular";
        this.orderBy = (options.args.orderBy instanceof Function) ? options.args.orderBy(this.propertiesMap) : options.args.orderBy;
    }
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    /**
     * Creates a new entity.
     */
    EntityMetadata.prototype.create = function () {
        var _this = this;
        // if target is set to a function (e.g. class) that can be created then create it
        if (this.target instanceof Function)
            return new this.target();
        // otherwise simply return a new empty object
        var newObject = {};
        this.relations
            .filter(function (relation) { return relation.isLazy; })
            .forEach(function (relation) { return _this.lazyRelationsWrapper.wrap(newObject, relation); });
        return newObject;
    };
    /**
     * Checks if given entity has an id.
     */
    EntityMetadata.prototype.hasId = function (entity) {
        if (!entity)
            return false;
        return this.primaryColumns.every(function (primaryColumn) {
            var value = primaryColumn.getEntityValue(entity);
            return value !== null && value !== undefined && value !== "";
        });
    };
    /**
     * Compares ids of the two entities.
     * Returns true if they match, false otherwise.
     */
    EntityMetadata.prototype.compareIds = function (firstId, secondId) {
        if (firstId === undefined || firstId === null || secondId === undefined || secondId === null)
            return false;
        return OrmUtils.deepCompare(firstId, secondId);
    };
    /**
     * Compares two different entity instances by their ids.
     * Returns true if they match, false otherwise.
     */
    EntityMetadata.prototype.compareEntities = function (firstEntity, secondEntity) {
        // if any entity ids are empty then they aren't equal
        var isFirstEntityEmpty = this.isEntityMapEmpty(firstEntity);
        var isSecondEntityEmpty = this.isEntityMapEmpty(secondEntity);
        if (isFirstEntityEmpty || isSecondEntityEmpty)
            return false;
        var firstEntityIds = this.getEntityIdMap(firstEntity);
        var secondEntityIds = this.getEntityIdMap(secondEntity);
        return this.compareIds(firstEntityIds, secondEntityIds);
    };
    /**
     * Checks if there is an embedded with a given property path.
     */
    EntityMetadata.prototype.hasEmbeddedWithPropertyPath = function (propertyPath) {
        return !!this.findEmbeddedWithPropertyPath(propertyPath);
    };
    /**
     * Finds embedded with a given property path.
     */
    EntityMetadata.prototype.findEmbeddedWithPropertyPath = function (propertyPath) {
        return this.embeddeds.find(function (embedded) {
            return embedded.propertyPath === propertyPath;
        });
    };
    /**
     * Finds column with a given property name.
     */
    EntityMetadata.prototype.findColumnWithPropertyName = function (propertyName) {
        return this.columns.find(function (column) { return column.propertyName === propertyName; });
    };
    /**
     * Finds column with a given property path.
     */
    EntityMetadata.prototype.findColumnWithPropertyPath = function (propertyPath) {
        var column = this.columns.find(function (column) { return column.propertyPath === propertyPath; });
        if (column)
            return column;
        // in the case if column with property path was not found, try to find a relation with such property path
        // if we find relation and it has a single join column then its the column user was seeking
        var relation = this.relations.find(function (relation) { return relation.propertyPath === propertyPath; });
        if (relation && relation.joinColumns.length === 1)
            return relation.joinColumns[0];
        return undefined;
    };
    /**
     * Finds columns with a given property path.
     * Property path can match a relation, and relations can contain multiple columns.
     */
    EntityMetadata.prototype.findColumnsWithPropertyPath = function (propertyPath) {
        var column = this.columns.find(function (column) { return column.propertyPath === propertyPath; });
        if (column)
            return [column];
        // in the case if column with property path was not found, try to find a relation with such property path
        // if we find relation and it has a single join column then its the column user was seeking
        var relation = this.relations.find(function (relation) { return relation.propertyPath === propertyPath; });
        if (relation && relation.joinColumns)
            return relation.joinColumns;
        return [];
    };
    /**
     * Finds column with a given database name.
     */
    EntityMetadata.prototype.findColumnWithDatabaseName = function (databaseName) {
        return this.columns.find(function (column) { return column.databaseName === databaseName; });
    };
    /**
     * Finds relation with the given name.
     */
    EntityMetadata.prototype.findRelationWithDbName = function (dbName) {
        return this.relationsWithJoinColumns.find(function (relation) {
            return !!relation.joinColumns.find(function (column) { return column.databaseName === dbName; });
        });
    };
    /**
     * Finds relation with the given property path.
     */
    EntityMetadata.prototype.findRelationWithPropertyPath = function (propertyPath) {
        return this.relations.find(function (relation) { return relation.propertyPath === propertyPath; });
    };
    /**
     * Computes property name of the entity using given PropertyTypeInFunction.
     */
    EntityMetadata.prototype.computePropertyPath = function (nameOrFn) {
        return typeof nameOrFn === "string" ? nameOrFn : nameOrFn(this.propertiesMap);
    };
    /**
     * Creates entity id map from the given entity ids array.
     */
    EntityMetadata.prototype.createEntityIdMap = function (ids) {
        if (!(ids instanceof Array))
            ids = [ids];
        return this.primaryColumns.reduce(function (map, column, index) {
            return OrmUtils.mergeDeep(map, column.createValueMap(ids[index]));
        }, {});
    };
    /**
     * Checks each id in the given entity id map if they all aren't empty.
     * If they all aren't empty it returns true.
     * If at least one id in the given map is empty it returns false.
     */
    EntityMetadata.prototype.isEntityMapEmpty = function (entity) {
        return !this.primaryColumns.every(function (column) {
            var value = column.getEntityValue(entity);
            return value !== null && value !== undefined;
        });
    };
    /**
     * Gets primary keys of the entity and returns them in a literal object.
     * For example, for Post{ id: 1, title: "hello" } where id is primary it will return { id: 1 }
     * For multiple primary keys it returns multiple keys in object.
     * For primary keys inside embeds it returns complex object literal with keys in them.
     */
    EntityMetadata.prototype.getEntityIdMap = function (entity) {
        if (!entity) // todo: shall it accept an empty entity? try to remove this
            return undefined;
        var map = this.primaryColumns.reduce(function (map, column) {
            if (column.isObjectId)
                return Object.assign(map, column.getEntityValueMap(entity));
            return OrmUtils.mergeDeep(map, column.getEntityValueMap(entity));
        }, {});
        return Object.keys(map).length > 0 ? map : undefined;
    };
    /**
     * Same as getEntityIdMap, but instead of id column property names it returns database column names.
     */
    EntityMetadata.prototype.getDatabaseEntityIdMap = function (entity) {
        var map = {};
        this.primaryColumns.forEach(function (column) {
            var entityValue = column.getEntityValue(entity);
            if (entityValue === null || entityValue === undefined)
                return;
            map[column.databaseName] = entityValue;
        });
        var hasAllIds = Object.keys(map).every(function (key) {
            return map[key] !== undefined && map[key] !== null;
        });
        return hasAllIds ? map : undefined;
    };
    /**
     * Creates a "mixed id map".
     * If entity has multiple primary keys (ids) then it will return just regular id map, like what getEntityIdMap returns.
     * But if entity has a single primary key then it will return just value of the id column of the entity, just value.
     * This is called mixed id map.
     */
    EntityMetadata.prototype.getEntityIdMixedMap = function (entity) {
        if (!entity) // todo: undefined entities should not go there??
            return entity;
        var idMap = this.getEntityIdMap(entity);
        if (this.hasMultiplePrimaryKeys) {
            return idMap;
        }
        else if (idMap) {
            return idMap[this.primaryColumns[0].propertyName]; // todo: what about parent primary column?
        }
        return idMap;
    };
    /**
     * Checks if given object contains ALL primary keys entity must have.
     * Returns true if it contains all of them, false if at least one of them is not defined.
     */
    EntityMetadata.prototype.checkIfObjectContainsAllPrimaryKeys = function (object) {
        return this.primaryColumns.every(function (primaryColumn) {
            return object.hasOwnProperty(primaryColumn.propertyName);
        });
    };
    /**
     * Iterates throw entity and finds and extracts all values from relations in the entity.
     * If relation value is an array its being flattened.
     */
    EntityMetadata.prototype.extractRelationValuesFromEntity = function (entity, relations) {
        var relationsAndValues = [];
        relations.forEach(function (relation) {
            var value = relation.getEntityValue(entity);
            if (value instanceof Array) {
                value.forEach(function (subValue) { return relationsAndValues.push([relation, subValue, relation.inverseEntityMetadata]); });
            }
            else if (value) {
                relationsAndValues.push([relation, value, relation.inverseEntityMetadata]);
            }
        });
        return relationsAndValues;
    };
    // ---------------------------------------------------------------------
    // Public Builder Methods
    // ---------------------------------------------------------------------
    /**
     * Registers a new column in the entity and recomputes all depend properties.
     */
    EntityMetadata.prototype.registerColumn = function (column) {
        this.ownColumns.push(column);
        this.columns = this.embeddeds.reduce(function (columns, embedded) { return columns.concat(embedded.columnsFromTree); }, this.ownColumns);
        this.parentIdColumns = this.columns.filter(function (column) { return column.isParentId; });
        this.primaryColumns = this.columns.filter(function (column) { return column.isPrimary; });
        this.hasMultiplePrimaryKeys = this.primaryColumns.length > 1;
        this.propertiesMap = this.createPropertiesMap();
    };
    /**
     * Creates a special object - all columns and relations of the object (plus columns and relations from embeds)
     * in a special format - { propertyName: propertyName }.
     *
     * example: Post{ id: number, name: string, counterEmbed: { count: number }, category: Category }.
     * This method will create following object:
     * { id: "id", counterEmbed: { count: "counterEmbed.count" }, category: "category" }
     */
    EntityMetadata.prototype.createPropertiesMap = function () {
        var map = {};
        this.columns.forEach(function (column) { return OrmUtils.mergeDeep(map, column.createValueMap(column.propertyPath)); });
        this.relations.forEach(function (relation) { return OrmUtils.mergeDeep(map, relation.createValueMap(relation.propertyPath)); });
        return map;
    };
    // ---------------------------------------------------------------------
    // Protected Methods
    // ---------------------------------------------------------------------
    /**
     * Builds table path using database name and schema name and table name.
     */
    EntityMetadata.prototype.buildTablePath = function (driver) {
        var tablePath = this.tableName;
        if (this.schema)
            tablePath = this.schema + "." + tablePath;
        if (this.database && !(driver instanceof PostgresDriver)) {
            if (!this.schema && driver instanceof SqlServerDriver) {
                tablePath = this.database + ".." + tablePath;
            }
            else {
                tablePath = this.database + "." + tablePath;
            }
        }
        return tablePath;
    };
    /**
     * Builds table path using schema name and database name.
     */
    EntityMetadata.prototype.buildSchemaPath = function (driver) {
        if (!this.schema)
            return undefined;
        return this.database && !(driver instanceof PostgresDriver) ? this.database + "." + this.schema : this.schema;
    };
    return EntityMetadata;
}());
export { EntityMetadata };

//# sourceMappingURL=EntityMetadata.js.map
