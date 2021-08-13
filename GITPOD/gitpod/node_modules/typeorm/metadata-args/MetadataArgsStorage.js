"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MetadataUtils_1 = require("../metadata-builder/MetadataUtils");
/**
 * Storage all metadatas args of all available types: tables, columns, subscribers, relations, etc.
 * Each metadata args represents some specifications of what it represents.
 * MetadataArgs used to create a real Metadata objects.
 */
var MetadataArgsStorage = /** @class */ (function () {
    function MetadataArgsStorage() {
        // -------------------------------------------------------------------------
        // Properties
        // -------------------------------------------------------------------------
        this.tables = [];
        this.entityRepositories = [];
        this.transactionEntityManagers = [];
        this.transactionRepositories = [];
        this.namingStrategies = [];
        this.entitySubscribers = [];
        this.indices = [];
        this.columns = [];
        this.generations = [];
        this.relations = [];
        this.joinColumns = [];
        this.joinTables = [];
        this.entityListeners = [];
        this.relationCounts = [];
        this.relationIds = [];
        this.embeddeds = [];
        this.inheritances = [];
        this.discriminatorValues = [];
    }
    MetadataArgsStorage.prototype.filterTables = function (target) {
        return this.filterByTarget(this.tables, target);
    };
    MetadataArgsStorage.prototype.filterColumns = function (target) {
        return this.filterByTargetAndWithoutDuplicateProperties(this.columns, target);
    };
    MetadataArgsStorage.prototype.findGenerated = function (target, propertyName) {
        return this.generations.find(function (generated) {
            return (target instanceof Array ? target.indexOf(generated.target) !== -1 : generated.target === target) && generated.propertyName === propertyName;
        });
    };
    MetadataArgsStorage.prototype.filterRelations = function (target) {
        return this.filterByTargetAndWithoutDuplicateProperties(this.relations, target);
    };
    MetadataArgsStorage.prototype.filterRelationIds = function (target) {
        return this.filterByTargetAndWithoutDuplicateProperties(this.relationIds, target);
    };
    MetadataArgsStorage.prototype.filterRelationCounts = function (target) {
        return this.filterByTargetAndWithoutDuplicateProperties(this.relationCounts, target);
    };
    MetadataArgsStorage.prototype.filterIndices = function (target) {
        // todo: implement parent-entity overrides?
        return this.indices.filter(function (index) {
            return target instanceof Array ? target.indexOf(index.target) !== -1 : index.target === target;
        });
    };
    MetadataArgsStorage.prototype.filterListeners = function (target) {
        return this.filterByTarget(this.entityListeners, target);
    };
    MetadataArgsStorage.prototype.filterEmbeddeds = function (target) {
        return this.filterByTargetAndWithoutDuplicateProperties(this.embeddeds, target);
    };
    MetadataArgsStorage.prototype.findJoinTable = function (target, propertyName) {
        return this.joinTables.find(function (joinTable) {
            return joinTable.target === target && joinTable.propertyName === propertyName;
        });
    };
    MetadataArgsStorage.prototype.filterJoinColumns = function (target, propertyName) {
        // todo: implement parent-entity overrides?
        return this.joinColumns.filter(function (joinColumn) {
            return joinColumn.target === target && joinColumn.propertyName === propertyName;
        });
    };
    MetadataArgsStorage.prototype.filterSubscribers = function (target) {
        return this.filterByTarget(this.entitySubscribers, target);
    };
    MetadataArgsStorage.prototype.filterNamingStrategies = function (target) {
        return this.filterByTarget(this.namingStrategies, target);
    };
    MetadataArgsStorage.prototype.filterTransactionEntityManagers = function (target) {
        return this.filterByTarget(this.transactionEntityManagers, target);
    };
    MetadataArgsStorage.prototype.filterTransactionRepository = function (target) {
        return this.filterByTarget(this.transactionRepositories, target);
    };
    MetadataArgsStorage.prototype.filterSingleTableChildren = function (target) {
        return this.tables.filter(function (table) {
            return table.target instanceof Function
                && target instanceof Function
                && MetadataUtils_1.MetadataUtils.isInherited(table.target, target)
                && table.type === "single-table-child";
        });
    };
    MetadataArgsStorage.prototype.findInheritanceType = function (target) {
        return this.inheritances.find(function (inheritance) { return inheritance.target === target; });
    };
    MetadataArgsStorage.prototype.findDiscriminatorValue = function (target) {
        return this.discriminatorValues.find(function (discriminatorValue) { return discriminatorValue.target === target; });
    };
    // -------------------------------------------------------------------------
    // Protected Methods
    // -------------------------------------------------------------------------
    /**
     * Filters given array by a given target or targets.
     */
    MetadataArgsStorage.prototype.filterByTarget = function (array, target) {
        return array.filter(function (table) {
            return target instanceof Array ? target.indexOf(table.target) !== -1 : table.target === target;
        });
    };
    /**
     * Filters given array by a given target or targets and prevents duplicate property names.
     */
    MetadataArgsStorage.prototype.filterByTargetAndWithoutDuplicateProperties = function (array, target) {
        var newArray = [];
        array.forEach(function (item) {
            var sameTarget = target instanceof Array ? target.indexOf(item.target) !== -1 : item.target === target;
            if (sameTarget) {
                if (!newArray.find(function (newItem) { return newItem.propertyName === item.propertyName; }))
                    newArray.push(item);
            }
        });
        return newArray;
    };
    return MetadataArgsStorage;
}());
exports.MetadataArgsStorage = MetadataArgsStorage;

//# sourceMappingURL=MetadataArgsStorage.js.map
