"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TableColumn_1 = require("./TableColumn");
var AbstractSqliteDriver_1 = require("../../driver/sqlite-abstract/AbstractSqliteDriver");
var MysqlDriver_1 = require("../../driver/mysql/MysqlDriver");
var OracleDriver_1 = require("../../driver/oracle/OracleDriver");
/**
 * Table in the database represented in this class.
 */
var Table = /** @class */ (function () {
    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    function Table(name, columns, justCreated, engine, database, schema) {
        /**
         * Table columns.
         */
        this.columns = [];
        /**
         * Table indices.
         */
        this.indices = [];
        /**
         * Table foreign keys.
         */
        this.foreignKeys = [];
        /**
         * Table primary keys.
         */
        this.primaryKeys = [];
        /**
         * Indicates if table was just created.
         * This is needed, for example to check if we need to skip primary keys creation
         * for new tables.
         */
        this.justCreated = false;
        this.name = name;
        if (columns) {
            this.columns = columns.map(function (column) {
                if (column instanceof TableColumn_1.TableColumn) {
                    return column;
                }
                else {
                    return new TableColumn_1.TableColumn(column);
                }
            });
        }
        if (justCreated !== undefined)
            this.justCreated = justCreated;
        this.engine = engine;
        this.database = database;
        this.schema = schema;
    }
    Object.defineProperty(Table.prototype, "primaryKeysWithoutGenerated", {
        // -------------------------------------------------------------------------
        // Accessors
        // -------------------------------------------------------------------------
        /**
         * Gets only those primary keys that does not
         */
        get: function () {
            var generatedColumn = this.columns.find(function (column) { return column.isGenerated; });
            if (!generatedColumn)
                return this.primaryKeys;
            return this.primaryKeys.filter(function (primaryKey) {
                return primaryKey.columnName !== generatedColumn.name;
            });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Table.prototype, "hasGeneratedColumn", {
        get: function () {
            return !!this.columns.find(function (column) { return column.isGenerated; });
        },
        enumerable: true,
        configurable: true
    });
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    /**
     * Clones this table to a new table with all properties cloned.
     */
    Table.prototype.clone = function () {
        var cloned = new Table(this.name);
        cloned.columns = this.columns.map(function (column) { return column.clone(); });
        cloned.indices = this.indices.map(function (index) { return index.clone(); });
        cloned.foreignKeys = this.foreignKeys.map(function (key) { return key.clone(); });
        cloned.primaryKeys = this.primaryKeys.map(function (key) { return key.clone(); });
        cloned.engine = this.engine;
        cloned.database = this.database;
        cloned.schema = this.schema;
        return cloned;
    };
    /**
     * Adds columns.
     */
    Table.prototype.addColumns = function (columns) {
        this.columns = this.columns.concat(columns);
    };
    /**
     * Replaces given column.
     */
    Table.prototype.replaceColumn = function (oldColumn, newColumn) {
        this.columns[this.columns.indexOf(oldColumn)] = newColumn;
    };
    /**
     * Removes a columns from this table.
     */
    Table.prototype.removeColumn = function (columnToRemove) {
        var foundColumn = this.columns.find(function (column) { return column.name === columnToRemove.name; });
        if (foundColumn)
            this.columns.splice(this.columns.indexOf(foundColumn), 1);
    };
    /**
     * Remove all columns from this table.
     */
    Table.prototype.removeColumns = function (columns) {
        var _this = this;
        columns.forEach(function (column) { return _this.removeColumn(column); });
    };
    /**
     * Adds all given primary keys.
     */
    Table.prototype.addPrimaryKeys = function (addedKeys) {
        var _this = this;
        addedKeys.forEach(function (key) {
            _this.primaryKeys.push(key);
            var index = _this.columns.findIndex(function (column) { return column.name === key.columnName; });
            if (index !== -1) {
                _this.columns[index].isPrimary = true;
            }
        });
    };
    /**
     * Removes all given primary keys.
     */
    Table.prototype.removePrimaryKeys = function (droppedKeys) {
        var _this = this;
        droppedKeys.forEach(function (key) {
            _this.primaryKeys.splice(_this.primaryKeys.indexOf(key), 1);
            var index = _this.columns.findIndex(function (column) { return column.name === key.columnName; });
            if (index !== -1) {
                _this.columns[index].isPrimary = false;
            }
        });
    };
    /**
     * Removes primary keys of the given columns.
     */
    Table.prototype.removePrimaryKeysOfColumns = function (columns) {
        this.primaryKeys = this.primaryKeys.filter(function (primaryKey) {
            return !columns.find(function (column) { return column.name === primaryKey.columnName; });
        });
    };
    /**
     * Adds foreign keys.
     */
    Table.prototype.addForeignKeys = function (foreignKeys) {
        this.foreignKeys = this.foreignKeys.concat(foreignKeys);
    };
    /**
     * Removes foreign key from this table.
     */
    Table.prototype.removeForeignKey = function (removedForeignKey) {
        var fk = this.foreignKeys.find(function (foreignKey) { return foreignKey.name === removedForeignKey.name; }); // this must be by name
        if (fk)
            this.foreignKeys.splice(this.foreignKeys.indexOf(fk), 1);
    };
    /**
     * Removes all foreign keys from this table.
     */
    Table.prototype.removeForeignKeys = function (dbForeignKeys) {
        var _this = this;
        dbForeignKeys.forEach(function (foreignKey) { return _this.removeForeignKey(foreignKey); });
    };
    /**
     * Removes indices from this table.
     */
    Table.prototype.removeIndex = function (tableIndex) {
        var index = this.indices.find(function (index) { return index.name === tableIndex.name; });
        if (index)
            this.indices.splice(this.indices.indexOf(index), 1);
    };
    /**
     * Differentiate columns of this table and columns from the given column metadatas columns
     * and returns only changed.
     */
    Table.prototype.findChangedColumns = function (driver, columnMetadatas) {
        var _this = this;
        return this.columns.filter(function (tableColumn) {
            var columnMetadata = columnMetadatas.find(function (columnMetadata) { return columnMetadata.databaseName === tableColumn.name; });
            if (!columnMetadata)
                return false; // we don't need new columns, we only need exist and changed
            // console.log(tableColumn.name, "!==", columnMetadata.databaseName); //  ||
            // console.log(tableColumn.type, "!==", driver.normalizeType(columnMetadata)); // ||
            // console.log(tableColumn.comment, "!==", columnMetadata.comment); //  ||
            // console.log(this.compareDefaultValues(driver.normalizeDefault(columnMetadata), tableColumn.default)); // || // we included check for generated here, because generated columns already can have default values
            // console.log(tableColumn.isNullable, "!==", columnMetadata.isNullable); //  ||
            // console.log(tableColumn.isUnique, "!==", columnMetadata.isUnique); //  ||
            // console.log(tableColumn.isGenerated, "!==", columnMetadata.isGenerated);
            var skipGenerationCheck = columnMetadata.generationStrategy === "uuid" && (driver instanceof AbstractSqliteDriver_1.AbstractSqliteDriver || driver instanceof MysqlDriver_1.MysqlDriver || driver instanceof OracleDriver_1.OracleDriver);
            return tableColumn.name !== columnMetadata.databaseName ||
                tableColumn.type !== driver.normalizeType(columnMetadata) ||
                tableColumn.comment !== columnMetadata.comment ||
                (!tableColumn.isGenerated && !_this.compareDefaultValues(driver.normalizeDefault(columnMetadata), tableColumn.default)) || // we included check for generated here, because generated columns already can have default values
                tableColumn.isNullable !== columnMetadata.isNullable ||
                tableColumn.isUnique !== driver.normalizeIsUnique(columnMetadata) ||
                // tableColumn.isPrimary !== columnMetadata.isPrimary ||
                (skipGenerationCheck === false && tableColumn.isGenerated !== columnMetadata.isGenerated) ||
                !_this.compareColumnLengths(driver, tableColumn, columnMetadata);
        });
    };
    Table.prototype.findColumnByName = function (name) {
        return this.columns.find(function (column) { return column.name === name; });
    };
    // -------------------------------------------------------------------------
    // Protected Methods
    // -------------------------------------------------------------------------
    /**
     * Compare column lengths only if the datatype supports it.
     */
    Table.prototype.compareColumnLengths = function (driver, tableColumn, columnMetadata) {
        var normalizedColumn = driver.normalizeType(columnMetadata);
        if (driver.withLengthColumnTypes.indexOf(normalizedColumn) !== -1) {
            var metadataLength = driver.getColumnLength(columnMetadata);
            // if we found something to compare with then do it, else skip it
            // use use case insensitive comparison to catch "MAX" vs "Max" case
            if (metadataLength)
                return tableColumn.length.toLowerCase() === metadataLength.toLowerCase();
        }
        return true;
    };
    /**
     * Checks if "DEFAULT" values in the column metadata and in the database are equal.
     */
    Table.prototype.compareDefaultValues = function (columnMetadataValue, databaseValue) {
        // if (typeof columnMetadataValue === "number")
        //     return columnMetadataValue === parseInt(databaseValue);
        // if (typeof columnMetadataValue === "boolean")
        //     return columnMetadataValue === (!!databaseValue || databaseValue === "false");
        // if (typeof columnMetadataValue === "function")
        // if (typeof columnMetadataValue === "string" && typeof databaseValue === "string")
        //     return columnMetadataValue.toLowerCase() === databaseValue.toLowerCase();
        if (typeof columnMetadataValue === "string" && typeof databaseValue === "string") {
            // we need to cut out "((x))" where x number generated by mssql
            columnMetadataValue = columnMetadataValue.replace(/\(\([0-9.]*\)\)$/g, "$1");
            databaseValue = databaseValue.replace(/\(\(([0-9.]*?)\)\)$/g, "$1");
            // we need to cut out "(" because in mssql we can understand returned value is a string or a function
            // as result compare cannot understand if default is really changed or not
            columnMetadataValue = columnMetadataValue.replace(/^\(|\)$/g, "");
            databaseValue = databaseValue.replace(/^\(|\)$/g, "");
            // we need to cut out "'" because in mysql we can understand returned value is a string or a function
            // as result compare cannot understand if default is really changed or not
            columnMetadataValue = columnMetadataValue.replace(/^'+|'+$/g, "");
            databaseValue = databaseValue.replace(/^'+|'+$/g, "");
        }
        // console.log("columnMetadataValue", columnMetadataValue);
        // console.log("databaseValue", databaseValue);
        return columnMetadataValue === databaseValue;
    };
    // -------------------------------------------------------------------------
    // Static Methods
    // -------------------------------------------------------------------------
    /**
     * Creates table from a given entity metadata.
     *
     * todo: need deeper implementation
     */
    Table.create = function (entityMetadata, driver) {
        var table = new Table(entityMetadata.tableName);
        table.engine = entityMetadata.engine;
        table.database = entityMetadata.database;
        table.schema = entityMetadata.schema;
        entityMetadata.columns.forEach(function (column) {
            var tableColumn = TableColumn_1.TableColumn.create(column, driver.normalizeType(column), driver.normalizeDefault(column), driver.getColumnLength(column));
            table.columns.push(tableColumn);
        });
        return table;
    };
    return Table;
}());
exports.Table = Table;

//# sourceMappingURL=Table.js.map
