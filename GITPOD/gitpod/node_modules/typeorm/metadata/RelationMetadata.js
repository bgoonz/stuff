"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Contains all information about some entity's relation.
 */
var RelationMetadata = /** @class */ (function () {
    // ---------------------------------------------------------------------
    // Constructor
    // ---------------------------------------------------------------------
    function RelationMetadata(options) {
        /**
         * Indicates if this is a parent (can be only many-to-one relation) relation in the tree tables.
         */
        this.isTreeParent = false;
        /**
         * Indicates if this is a children (can be only one-to-many relation) relation in the tree tables.
         */
        this.isTreeChildren = false;
        /**
         * Indicates if this relation's column is a primary key.
         * Can be used only for many-to-one and owner one-to-one relations.
         */
        this.isPrimary = false;
        /**
         * Indicates if this relation is lazily loaded.
         */
        this.isLazy = false;
        /**
         * Indicates if this relation is eagerly loaded.
         */
        this.isEager = false;
        /**
         * If set to true then related objects are allowed to be inserted to the database.
         */
        this.isCascadeInsert = false;
        /**
         * If set to true then related objects are allowed to be updated in the database.
         */
        this.isCascadeUpdate = false;
        /**
         * If set to true then related objects are allowed to be remove from the database.
         */
        this.isCascadeRemove = false;
        /**
         * Indicates if relation column value can be nullable or not.
         */
        this.isNullable = true;
        /**
         * Indicates if this side is an owner of this relation.
         */
        this.isOwning = false;
        /**
         * Checks if this relation's type is "one-to-one".
         */
        this.isOneToOne = false;
        /**
         * Checks if this relation is owner side of the "one-to-one" relation.
         * Owner side means this side of relation has a join column in the table.
         */
        this.isOneToOneOwner = false;
        /**
         * Checks if this relation has a join column (e.g. is it many-to-one or one-to-one owner side).
         */
        this.isWithJoinColumn = false;
        /**
         * Checks if this relation is NOT owner side of the "one-to-one" relation.
         * NOT owner side means this side of relation does not have a join column in the table.
         */
        this.isOneToOneNotOwner = false;
        /**
         * Checks if this relation's type is "one-to-many".
         */
        this.isOneToMany = false;
        /**
         * Checks if this relation's type is "many-to-one".
         */
        this.isManyToOne = false;
        /**
         * Checks if this relation's type is "many-to-many".
         */
        this.isManyToMany = false;
        /**
         * Checks if this relation's type is "many-to-many", and is owner side of the relationship.
         * Owner side means this side of relation has a join table.
         */
        this.isManyToManyOwner = false;
        /**
         * Checks if this relation's type is "many-to-many", and is NOT owner side of the relationship.
         * Not owner side means this side of relation does not have a join table.
         */
        this.isManyToManyNotOwner = false;
        /**
         * Foreign keys created for this relation.
         */
        this.foreignKeys = [];
        /**
         * Join table columns.
         * Join columns can be obtained only from owner side of the relation.
         * From non-owner side of the relation join columns will be empty.
         * If this relation is a many-to-one/one-to-one then it takes join columns from the current entity.
         * If this relation is many-to-many then it takes all owner join columns from the junction entity.
         */
        this.joinColumns = [];
        /**
         * Inverse join table columns.
         * Inverse join columns are supported only for many-to-many relations
         * and can be obtained only from owner side of the relation.
         * From non-owner side of the relation join columns will be undefined.
         */
        this.inverseJoinColumns = [];
        this.entityMetadata = options.entityMetadata;
        this.embeddedMetadata = options.embeddedMetadata;
        var args = options.args;
        this.target = args.target;
        this.propertyName = args.propertyName;
        this.relationType = args.relationType;
        if (args.inverseSideProperty)
            this.givenInverseSidePropertyFactory = args.inverseSideProperty;
        this.isLazy = args.isLazy || false;
        this.isCascadeInsert = args.options.cascadeInsert || args.options.cascadeAll || false;
        this.isCascadeUpdate = args.options.cascadeUpdate || args.options.cascadeAll || false;
        this.isCascadeRemove = args.options.cascadeRemove || args.options.cascadeAll || false;
        this.isNullable = args.options.nullable === false || this.isPrimary ? false : true;
        this.onDelete = args.options.onDelete;
        this.isPrimary = args.options.primary || false;
        this.isEager = args.options.eager || false;
        this.isTreeParent = args.isTreeParent || false;
        this.isTreeChildren = args.isTreeChildren || false;
        this.type = args.type instanceof Function ? args.type() : args.type;
        this.isOneToOne = this.relationType === "one-to-one";
        this.isOneToMany = this.relationType === "one-to-many";
        this.isManyToOne = this.relationType === "many-to-one";
        this.isManyToMany = this.relationType === "many-to-many";
        this.isOneToOneNotOwner = this.isOneToOne ? true : false;
        this.isManyToManyNotOwner = this.isManyToMany ? true : false;
    }
    // ---------------------------------------------------------------------
    // Public Methods
    // ---------------------------------------------------------------------
    /**
     * Extracts column value from the given entity.
     * If column is in embedded (or recursive embedded) it extracts its value from there.
     */
    RelationMetadata.prototype.getEntityValue = function (entity) {
        // extract column value from embeddeds of entity if column is in embedded
        if (this.embeddedMetadata) {
            // example: post[data][information][counters].id where "data", "information" and "counters" are embeddeds
            // we need to get value of "id" column from the post real entity object
            // first step - we extract all parent properties of the entity relative to this column, e.g. [data, information, counters]
            var propertyNames = this.embeddedMetadata.parentPropertyNames.slice();
            // next we need to access post[data][information][counters][this.propertyName] to get column value from the counters
            // this recursive function takes array of generated property names and gets the post[data][information][counters] embed
            var extractEmbeddedColumnValue_1 = function (propertyNames, value) {
                var propertyName = propertyNames.shift();
                return propertyName ? extractEmbeddedColumnValue_1(propertyNames, value[propertyName]) : value;
            };
            // once we get nested embed object we get its column, e.g. post[data][information][counters][this.propertyName]
            var embeddedObject = extractEmbeddedColumnValue_1(propertyNames, entity);
            return embeddedObject ? embeddedObject[this.isLazy ? "__" + this.propertyName + "__" : this.propertyName] : undefined;
        }
        else { // no embeds - no problems. Simply return column name by property name of the entity
            return entity[this.isLazy ? "__" + this.propertyName + "__" : this.propertyName];
        }
    };
    /**
     * Sets given entity's relation's value.
     * Using of this method helps to set entity relation's value of the lazy and non-lazy relations.
     */
    RelationMetadata.prototype.setEntityValue = function (entity, value) {
        var _this = this;
        if (this.embeddedMetadata) {
            // first step - we extract all parent properties of the entity relative to this column, e.g. [data, information, counters]
            var extractEmbeddedColumnValue_2 = function (embeddedMetadatas, map) {
                // if (!object[embeddedMetadata.propertyName])
                //     object[embeddedMetadata.propertyName] = embeddedMetadata.create();
                var embeddedMetadata = embeddedMetadatas.shift();
                if (embeddedMetadata) {
                    if (!map[embeddedMetadata.propertyName])
                        map[embeddedMetadata.propertyName] = embeddedMetadata.create();
                    extractEmbeddedColumnValue_2(embeddedMetadatas, map[embeddedMetadata.propertyName]);
                    return map;
                }
                map[_this.propertyName] = value;
                return map;
            };
            return extractEmbeddedColumnValue_2(this.embeddedMetadata.embeddedMetadataTree.slice(), entity);
        }
        else {
            entity[this.propertyName] = value;
        }
    };
    /**
     * Creates entity id map from the given entity ids array.
     */
    RelationMetadata.prototype.createValueMap = function (value) {
        var _this = this;
        // extract column value from embeds of entity if column is in embedded
        if (this.embeddedMetadata) {
            // example: post[data][information][counters].id where "data", "information" and "counters" are embeddeds
            // we need to get value of "id" column from the post real entity object and return it in a
            // { data: { information: { counters: { id: ... } } } } format
            // first step - we extract all parent properties of the entity relative to this column, e.g. [data, information, counters]
            var propertyNames = this.embeddedMetadata.parentPropertyNames.slice();
            // now need to access post[data][information][counters] to get column value from the counters
            // and on each step we need to create complex literal object, e.g. first { data },
            // then { data: { information } }, then { data: { information: { counters } } },
            // then { data: { information: { counters: [this.propertyName]: entity[data][information][counters][this.propertyName] } } }
            // this recursive function helps doing that
            var extractEmbeddedColumnValue_3 = function (propertyNames, map) {
                var propertyName = propertyNames.shift();
                if (propertyName) {
                    map[propertyName] = {};
                    extractEmbeddedColumnValue_3(propertyNames, map[propertyName]);
                    return map;
                }
                map[_this.propertyName] = value;
                return map;
            };
            return extractEmbeddedColumnValue_3(propertyNames, {});
        }
        else { // no embeds - no problems. Simply return column property name and its value of the entity
            return _a = {}, _a[this.propertyName] = value, _a;
        }
        var _a;
    };
    // ---------------------------------------------------------------------
    // Builder Methods
    // ---------------------------------------------------------------------
    /**
     * Builds some depend relation metadata properties.
     * This builder method should be used only after embedded metadata tree was build.
     */
    RelationMetadata.prototype.build = function () {
        this.propertyPath = this.buildPropertyPath();
    };
    /**
     * Registers given foreign keys in the relation.
     * This builder method should be used to register foreign key in the relation.
     */
    RelationMetadata.prototype.registerForeignKeys = function () {
        var foreignKeys = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            foreignKeys[_i] = arguments[_i];
        }
        (_a = this.foreignKeys).push.apply(_a, foreignKeys);
        this.joinColumns = this.foreignKeys[0] ? this.foreignKeys[0].columns : [];
        this.inverseJoinColumns = this.foreignKeys[1] ? this.foreignKeys[1].columns : [];
        this.isOwning = this.isManyToOne || ((this.isManyToMany || this.isOneToOne) && this.joinColumns.length > 0);
        this.isOneToOneOwner = this.isOneToOne && this.isOwning;
        this.isOneToOneNotOwner = this.isOneToOne && !this.isOwning;
        this.isManyToManyOwner = this.isManyToMany && this.isOwning;
        this.isManyToManyNotOwner = this.isManyToMany && !this.isOwning;
        this.isWithJoinColumn = this.isManyToOne || this.isOneToOneOwner;
        var _a;
    };
    /**
     * Registers a given junction entity metadata.
     * This builder method can be called after junction entity metadata for the many-to-many relation was created.
     */
    RelationMetadata.prototype.registerJunctionEntityMetadata = function (junctionEntityMetadata) {
        this.junctionEntityMetadata = junctionEntityMetadata;
        this.joinTableName = junctionEntityMetadata.tableName;
        if (this.inverseRelation) {
            this.inverseRelation.junctionEntityMetadata = junctionEntityMetadata;
            this.joinTableName = junctionEntityMetadata.tableName;
        }
    };
    /**
     * Builds inverse side property path based on given inverse side property factory.
     * This builder method should be used only after properties map of the inverse entity metadata was build.
     */
    RelationMetadata.prototype.buildInverseSidePropertyPath = function () {
        if (this.givenInverseSidePropertyFactory) {
            var ownerEntityPropertiesMap = this.inverseEntityMetadata.propertiesMap;
            if (typeof this.givenInverseSidePropertyFactory === "function")
                return this.givenInverseSidePropertyFactory(ownerEntityPropertiesMap);
            if (typeof this.givenInverseSidePropertyFactory === "string")
                return this.givenInverseSidePropertyFactory;
        }
        else if (this.isTreeParent && this.entityMetadata.treeChildrenRelation) {
            return this.entityMetadata.treeChildrenRelation.propertyName;
        }
        else if (this.isTreeChildren && this.entityMetadata.treeParentRelation) {
            return this.entityMetadata.treeParentRelation.propertyName;
        }
        return "";
    };
    /**
     * Builds relation's property path based on its embedded tree.
     */
    RelationMetadata.prototype.buildPropertyPath = function () {
        if (!this.embeddedMetadata || !this.embeddedMetadata.parentPropertyNames.length)
            return this.propertyName;
        return this.embeddedMetadata.parentPropertyNames.join(".") + "." + this.propertyName;
    };
    return RelationMetadata;
}());
exports.RelationMetadata = RelationMetadata;

//# sourceMappingURL=RelationMetadata.js.map
