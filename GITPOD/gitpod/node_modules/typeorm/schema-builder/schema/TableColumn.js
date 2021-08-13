"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Table's columns in the database represented in this class.
 */
var TableColumn = /** @class */ (function () {
    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    function TableColumn(options) {
        /**
         * Indicates if column is NULL, or is NOT NULL in the database.
         */
        this.isNullable = false;
        /**
         * Indicates if column is auto-generated sequence.
         */
        this.isGenerated = false;
        /**
         * Indicates if column is a primary key.
         */
        this.isPrimary = false;
        /**
         * Indicates if column has unique value.
         */
        this.isUnique = false;
        /**
         * Indicates if column stores array.
         */
        this.isArray = false;
        /**
         * Column type's length. Used only on some column types.
         * For example type = "string" and length = "100" means that ORM will create a column with type varchar(100).
         */
        this.length = "";
        if (options) {
            this.name = options.name || "";
            this.type = options.type || "";
            this.length = options.length || "";
            this.charset = options.charset;
            this.collation = options.collation;
            this.precision = options.precision;
            this.scale = options.scale;
            this.default = options.default;
            this.isNullable = options.isNullable || false;
            this.isGenerated = options.isGenerated || false;
            this.generationStrategy = options.generationStrategy;
            this.isPrimary = options.isPrimary || false;
            this.isUnique = options.isUnique || false;
            this.comment = options.comment;
            this.enum = options.enum;
        }
    }
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    /**
     * Clones this column to a new column with exact same properties as this column has.
     */
    TableColumn.prototype.clone = function () {
        var newTableColumn = new TableColumn();
        newTableColumn.name = this.name;
        newTableColumn.type = this.type;
        newTableColumn.length = this.length;
        newTableColumn.charset = this.charset;
        newTableColumn.collation = this.collation;
        newTableColumn.precision = this.precision;
        newTableColumn.scale = this.scale;
        newTableColumn.enum = this.enum;
        newTableColumn.default = this.default;
        newTableColumn.isNullable = this.isNullable;
        newTableColumn.isGenerated = this.isGenerated;
        newTableColumn.generationStrategy = this.generationStrategy;
        newTableColumn.isPrimary = this.isPrimary;
        newTableColumn.isUnique = this.isUnique;
        newTableColumn.isArray = this.isArray;
        newTableColumn.comment = this.comment;
        return newTableColumn;
    };
    // -------------------------------------------------------------------------
    // Static Methods
    // -------------------------------------------------------------------------
    /**
     * Creates a new column based on the given column metadata.
     */
    TableColumn.create = function (columnMetadata, normalizedType, normalizedDefault, normalizedLength) {
        var tableColumn = new TableColumn();
        tableColumn.name = columnMetadata.databaseName;
        tableColumn.length = normalizedLength;
        tableColumn.charset = columnMetadata.charset;
        tableColumn.collation = columnMetadata.collation;
        tableColumn.precision = columnMetadata.precision;
        tableColumn.scale = columnMetadata.scale;
        tableColumn.default = normalizedDefault;
        tableColumn.comment = columnMetadata.comment;
        tableColumn.isGenerated = columnMetadata.isGenerated;
        tableColumn.generationStrategy = columnMetadata.generationStrategy;
        tableColumn.isNullable = columnMetadata.isNullable;
        tableColumn.type = normalizedType;
        tableColumn.isPrimary = columnMetadata.isPrimary;
        tableColumn.isUnique = columnMetadata.isUnique;
        tableColumn.isArray = columnMetadata.isArray || false;
        tableColumn.enum = columnMetadata.enum;
        return tableColumn;
    };
    return TableColumn;
}());
exports.TableColumn = TableColumn;

//# sourceMappingURL=TableColumn.js.map
