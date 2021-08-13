"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Index metadata contains all information about table's index.
 */
var IndexMetadata = /** @class */ (function () {
    // ---------------------------------------------------------------------
    // Constructor
    // ---------------------------------------------------------------------
    function IndexMetadata(options) {
        /**
         * Indicates if this index must be unique.
         */
        this.isUnique = false;
        /**
         * Indexed columns.
         */
        this.columns = [];
        /**
         * Map of column names with order set.
         * Used only by MongoDB driver.
         */
        this.columnNamesWithOrderingMap = {};
        this.entityMetadata = options.entityMetadata;
        this.embeddedMetadata = options.embeddedMetadata;
        if (options.columns)
            this.columns = options.columns;
        if (options.args) {
            this.target = options.args.target;
            this.isUnique = options.args.unique;
            this.isSparse = options.args.sparse;
            this.givenName = options.args.name;
            this.givenColumnNames = options.args.columns;
        }
    }
    // ---------------------------------------------------------------------
    // Public Build Methods
    // ---------------------------------------------------------------------
    /**
     * Builds some depend index properties.
     * Must be called after all entity metadata's properties map, columns and relations are built.
     */
    IndexMetadata.prototype.build = function (namingStrategy) {
        var _this = this;
        var map = {};
        this.tableName = this.entityMetadata.tableName;
        // if columns already an array of string then simply return it
        if (this.givenColumnNames) {
            var columnPropertyPaths = [];
            if (this.givenColumnNames instanceof Array) {
                columnPropertyPaths = this.givenColumnNames.map(function (columnName) {
                    if (_this.embeddedMetadata)
                        return _this.embeddedMetadata.propertyPath + "." + columnName;
                    return columnName;
                });
                columnPropertyPaths.forEach(function (propertyPath) { return map[propertyPath] = 1; });
            }
            else { // todo: indices in embeds are not implemented in this syntax. deprecate this syntax?
                // if columns is a function that returns array of field names then execute it and get columns names from it
                var columnsFnResult_1 = this.givenColumnNames(this.entityMetadata.propertiesMap);
                if (columnsFnResult_1 instanceof Array) {
                    columnPropertyPaths = columnsFnResult_1.map(function (i) { return String(i); });
                    columnPropertyPaths.forEach(function (name) { return map[name] = 1; });
                }
                else {
                    columnPropertyPaths = Object.keys(columnsFnResult_1).map(function (i) { return String(i); });
                    Object.keys(columnsFnResult_1).forEach(function (columnName) { return map[columnName] = columnsFnResult_1[columnName]; });
                }
            }
            this.columns = columnPropertyPaths.map(function (propertyPath) {
                var columnWithSameName = _this.entityMetadata.columns.find(function (column) { return column.propertyPath === propertyPath; });
                if (columnWithSameName) {
                    return [columnWithSameName];
                }
                var relationWithSameName = _this.entityMetadata.relations.find(function (relation) { return relation.isWithJoinColumn && relation.propertyName === propertyPath; });
                if (relationWithSameName) {
                    return relationWithSameName.joinColumns;
                }
                throw new Error("Index " + (_this.givenName ? "\"" + _this.givenName + "\" " : "") + "contains column that is missing in the entity: " + propertyPath);
            })
                .reduce(function (a, b) { return a.concat(b); });
        }
        this.columnNamesWithOrderingMap = Object.keys(map).reduce(function (updatedMap, key) {
            var column = _this.entityMetadata.columns.find(function (column) { return column.propertyPath === key; });
            if (column)
                updatedMap[column.databaseName] = map[key];
            return updatedMap;
        }, {});
        this.name = namingStrategy.indexName(this.givenName ? this.givenName : undefined, this.entityMetadata.tableName, this.columns.map(function (column) { return column.databaseName; }));
        return this;
    };
    return IndexMetadata;
}());
exports.IndexMetadata = IndexMetadata;

//# sourceMappingURL=IndexMetadata.js.map
