"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Database's table index stored in this class.
 */
var TableIndex = /** @class */ (function () {
    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    function TableIndex(tableName, name, columnNames, isUnique) {
        this.tableName = tableName;
        this.name = name;
        this.columnNames = columnNames;
        this.isUnique = isUnique;
    }
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    /**
     * Creates a new copy of this index with exactly same properties.
     */
    TableIndex.prototype.clone = function () {
        return new TableIndex(this.tableName, this.name, this.columnNames.map(function (name) { return name; }), this.isUnique);
    };
    // -------------------------------------------------------------------------
    // Static Methods
    // -------------------------------------------------------------------------
    /**
     * Creates index from the index metadata object.
     */
    TableIndex.create = function (indexMetadata) {
        return new TableIndex(indexMetadata.entityMetadata.tableName, indexMetadata.name, indexMetadata.columns.map(function (column) { return column.databaseName; }), indexMetadata.isUnique);
    };
    return TableIndex;
}());
exports.TableIndex = TableIndex;

//# sourceMappingURL=TableIndex.js.map
