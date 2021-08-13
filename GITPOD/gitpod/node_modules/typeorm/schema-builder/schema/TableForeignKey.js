"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Foreign key from the database stored in this class.
 */
var TableForeignKey = /** @class */ (function () {
    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    function TableForeignKey(name, columnNames, referencedColumnNames, referencedTable, referencedTablePath, onDelete) {
        this.name = name;
        this.columnNames = columnNames;
        this.referencedColumnNames = referencedColumnNames;
        this.referencedTableName = referencedTable;
        this.referencedTablePath = referencedTablePath;
        this.onDelete = onDelete;
    }
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    /**
     * Creates a new copy of this foreign key with exactly same properties.
     */
    TableForeignKey.prototype.clone = function () {
        return new TableForeignKey(this.name, this.columnNames, this.referencedColumnNames, this.referencedTableName, this.referencedTablePath);
    };
    // -------------------------------------------------------------------------
    // Static Methods
    // -------------------------------------------------------------------------
    /**
     * Creates a new foreign schema from the given foreign key metadata.
     */
    TableForeignKey.create = function (metadata) {
        return new TableForeignKey(metadata.name, metadata.columnNames, metadata.referencedColumnNames, metadata.referencedTableName, metadata.referencedEntityMetadata.tablePath, metadata.onDelete);
    };
    return TableForeignKey;
}());
exports.TableForeignKey = TableForeignKey;

//# sourceMappingURL=TableForeignKey.js.map
