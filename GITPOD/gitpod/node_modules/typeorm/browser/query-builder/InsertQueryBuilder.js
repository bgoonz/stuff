var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { QueryBuilder } from "./QueryBuilder";
import { SqlServerDriver } from "../driver/sqlserver/SqlServerDriver";
import { PostgresDriver } from "../driver/postgres/PostgresDriver";
import { AbstractSqliteDriver } from "../driver/sqlite-abstract/AbstractSqliteDriver";
/**
 * Allows to build complex sql queries in a fashion way and execute those queries.
 */
var InsertQueryBuilder = /** @class */ (function (_super) {
    __extends(InsertQueryBuilder, _super);
    function InsertQueryBuilder() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // -------------------------------------------------------------------------
    // Public Implemented Methods
    // -------------------------------------------------------------------------
    /**
     * Gets generated sql query without parameters being replaced.
     */
    InsertQueryBuilder.prototype.getQuery = function () {
        var sql = this.createInsertExpression();
        return sql.trim();
    };
    /**
     * Optional returning/output clause.
     */
    InsertQueryBuilder.prototype.output = function (output) {
        return this.returning(output);
    };
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    /**
     * Specifies INTO which entity's table insertion will be executed.
     */
    InsertQueryBuilder.prototype.into = function (entityTarget, columns) {
        var mainAlias = this.createFromAlias(entityTarget);
        this.expressionMap.setMainAlias(mainAlias);
        this.expressionMap.insertColumns = columns || [];
        return this;
    };
    /**
     * Values needs to be inserted into table.
     */
    InsertQueryBuilder.prototype.values = function (values) {
        this.expressionMap.valuesSet = values;
        return this;
    };
    /**
     * Optional returning/output clause.
     */
    InsertQueryBuilder.prototype.returning = function (returning) {
        if (this.connection.driver instanceof SqlServerDriver || this.connection.driver instanceof PostgresDriver) {
            this.expressionMap.returning = returning;
            return this;
        }
        else
            throw new Error("OUTPUT or RETURNING clause only supported by MS SQLServer or PostgreSQL");
    };
    /**
     * Adds additional ON CONFLICT statement supported in postgres.
     */
    InsertQueryBuilder.prototype.onConflict = function (statement) {
        this.expressionMap.onConflict = statement;
        return this;
    };
    // -------------------------------------------------------------------------
    // Protected Methods
    // -------------------------------------------------------------------------
    /**
     * Creates INSERT express used to perform insert query.
     */
    InsertQueryBuilder.prototype.createInsertExpression = function () {
        var _this = this;
        var valueSets = this.getValueSets();
        var values, columnNames;
        if (this.expressionMap.mainAlias.hasMetadata) {
            var columns_1 = this.expressionMap.mainAlias.metadata.columns.filter(function (column) {
                if (!_this.expressionMap.insertColumns.length)
                    return !column.isGenerated;
                return _this.expressionMap.insertColumns.indexOf(column.propertyPath) !== -1;
            });
            // get a table name and all column database names
            columnNames = columns_1.map(function (column) { return _this.escape(column.databaseName); }).join(", ");
            // get values needs to be inserted
            values = valueSets.map(function (valueSet, insertionIndex) {
                var columnValues = columns_1.map(function (column) {
                    var paramName = "_inserted_" + insertionIndex + "_" + column.databaseName;
                    var value = _this.connection.driver.preparePersistentValue(column.getEntityValue(valueSet), column);
                    if (value instanceof Function) { // support for SQL expressions in update query
                        return value();
                    }
                    else if (value === undefined) {
                        if (_this.connection.driver instanceof AbstractSqliteDriver) {
                            return "NULL";
                        }
                        else {
                            return "DEFAULT";
                        }
                    }
                    else {
                        if (_this.connection.driver instanceof SqlServerDriver) {
                            _this.setParameter(paramName, _this.connection.driver.parametrizeValue(column, value));
                        }
                        else {
                            _this.setParameter(paramName, value);
                        }
                        return ":" + paramName;
                    }
                });
                return "(" + columnValues.join(",") + ")";
            }).join(", ");
        }
        else { // for tables without metadata
            // get a table name and all column database names
            columnNames = this.expressionMap.insertColumns.join(", ");
            // get values needs to be inserted
            values = valueSets.map(function (valueSet, insertionIndex) {
                var columnValues = Object.keys(valueSet).map(function (columnName) {
                    var paramName = "_inserted_" + insertionIndex + "_" + columnName;
                    var value = valueSet[columnName];
                    if (value instanceof Function) { // support for SQL expressions in update query
                        return value();
                    }
                    else if (value === undefined) {
                        if (_this.connection.driver instanceof AbstractSqliteDriver) {
                            return "NULL";
                        }
                        else {
                            return "DEFAULT";
                        }
                    }
                    else {
                        _this.setParameter(paramName, value);
                        return ":" + paramName;
                    }
                });
                return "(" + columnValues.join(",") + ")";
            }).join(", ");
        }
        // generate sql query
        if (this.expressionMap.returning !== "" && this.connection.driver instanceof PostgresDriver) {
            return "INSERT INTO " + this.getTableName(this.getMainTableName()) + (columnNames ? "(" + columnNames + ")" : "") + " VALUES " + values + (this.expressionMap.onConflict ? " ON CONFLICT " + this.expressionMap.onConflict : "") + " RETURNING " + this.expressionMap.returning;
        }
        else if (this.expressionMap.returning !== "" && this.connection.driver instanceof SqlServerDriver) {
            return "INSERT INTO " + this.getTableName(this.getMainTableName()) + "(" + columnNames + ") OUTPUT " + this.expressionMap.returning + " VALUES " + values;
        }
        else {
            return "INSERT INTO " + this.getTableName(this.getMainTableName()) + "(" + columnNames + ") VALUES " + values + (this.expressionMap.onConflict ? " ON CONFLICT " + this.expressionMap.onConflict : "");
        }
    };
    /**
     * Gets array of values need to be inserted into the target table.
     */
    InsertQueryBuilder.prototype.getValueSets = function () {
        if (this.expressionMap.valuesSet instanceof Array && this.expressionMap.valuesSet.length > 0)
            return this.expressionMap.valuesSet;
        if (this.expressionMap.valuesSet instanceof Object)
            return [this.expressionMap.valuesSet];
        throw new Error("Cannot perform insert query because values are not defined. Call \"qb.values(...)\" method to specify inserted values.");
    };
    return InsertQueryBuilder;
}(QueryBuilder));
export { InsertQueryBuilder };

//# sourceMappingURL=InsertQueryBuilder.js.map
