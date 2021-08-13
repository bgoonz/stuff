"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RandomGenerator_1 = require("../util/RandomGenerator");
var StringUtils_1 = require("../util/StringUtils");
/**
 * Naming strategy that is used by default.
 */
var DefaultNamingStrategy = /** @class */ (function () {
    function DefaultNamingStrategy() {
    }
    /**
     * Normalizes table name.
     *
     * @param targetName Name of the target entity that can be used to generate a table name.
     * @param userSpecifiedName For example if user specified a table name in a decorator, e.g. @Entity("name")
     */
    DefaultNamingStrategy.prototype.tableName = function (targetName, userSpecifiedName) {
        return userSpecifiedName ? userSpecifiedName : StringUtils_1.snakeCase(targetName);
    };
    /**
     * Creates a table name for a junction table of a closure table.
     *
     * @param originalClosureTableName Name of the closure table which owns this junction table.
     */
    DefaultNamingStrategy.prototype.closureJunctionTableName = function (originalClosureTableName) {
        return originalClosureTableName + "_closure";
    };
    DefaultNamingStrategy.prototype.columnName = function (propertyName, customName, embeddedPrefixes) {
        if (embeddedPrefixes.length)
            return StringUtils_1.camelCase(embeddedPrefixes.join("_")) + (customName ? StringUtils_1.titleCase(customName) : StringUtils_1.titleCase(propertyName));
        return customName ? customName : propertyName;
    };
    DefaultNamingStrategy.prototype.relationName = function (propertyName) {
        return propertyName;
    };
    DefaultNamingStrategy.prototype.indexName = function (customName, tableName, columns) {
        if (customName)
            return customName;
        var key = "ind_" + tableName + "_" + columns.join("_");
        return "ind_" + RandomGenerator_1.RandomGenerator.sha1(key).substr(0, 26);
    };
    DefaultNamingStrategy.prototype.joinColumnName = function (relationName, referencedColumnName) {
        return StringUtils_1.camelCase(relationName + "_" + referencedColumnName);
    };
    DefaultNamingStrategy.prototype.joinTableName = function (firstTableName, secondTableName, firstPropertyName, secondPropertyName) {
        return StringUtils_1.snakeCase(firstTableName + "_" + firstPropertyName.replace(/\./gi, "_") + "_" + secondTableName);
    };
    DefaultNamingStrategy.prototype.joinTableColumnDuplicationPrefix = function (columnName, index) {
        return columnName + "_" + index;
    };
    DefaultNamingStrategy.prototype.joinTableColumnName = function (tableName, propertyName, columnName) {
        return StringUtils_1.camelCase(tableName + "_" + (columnName ? columnName : propertyName));
    };
    DefaultNamingStrategy.prototype.joinTableInverseColumnName = function (tableName, propertyName, columnName) {
        return this.joinTableColumnName(tableName, propertyName, columnName);
    };
    DefaultNamingStrategy.prototype.foreignKeyName = function (tableName, columnNames, referencedTableName, referencedColumnNames) {
        var key = tableName + "_" + columnNames.join("_") + "_" + referencedTableName + "_" + referencedColumnNames.join("_");
        return "fk_" + RandomGenerator_1.RandomGenerator.sha1(key).substr(0, 27); // todo: use crypto instead?
    };
    DefaultNamingStrategy.prototype.classTableInheritanceParentColumnName = function (parentTableName, parentTableIdPropertyName) {
        return StringUtils_1.camelCase(parentTableName + "_" + parentTableIdPropertyName);
    };
    /**
     * Adds globally set prefix to the table name.
     * This method is executed no matter if prefix was set or not.
     * Table name is either user's given table name, either name generated from entity target.
     * Note that table name comes here already normalized by #tableName method.
     */
    DefaultNamingStrategy.prototype.prefixTableName = function (prefix, tableName) {
        return prefix + tableName;
    };
    return DefaultNamingStrategy;
}());
exports.DefaultNamingStrategy = DefaultNamingStrategy;

//# sourceMappingURL=DefaultNamingStrategy.js.map
