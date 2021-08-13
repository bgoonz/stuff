"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var QueryBuilder_1 = require("./QueryBuilder");
var MysqlDriver_1 = require("../driver/mysql/MysqlDriver");
var SqlServerDriver_1 = require("../driver/sqlserver/SqlServerDriver");
var PostgresDriver_1 = require("../driver/postgres/PostgresDriver");
var EntityMetadataUtils_1 = require("../metadata/EntityMetadataUtils");
var LimitOnUpdateNotSupportedError_1 = require("../error/LimitOnUpdateNotSupportedError");
/**
 * Allows to build complex sql queries in a fashion way and execute those queries.
 */
var UpdateQueryBuilder = /** @class */ (function (_super) {
    __extends(UpdateQueryBuilder, _super);
    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    function UpdateQueryBuilder(connectionOrQueryBuilder, queryRunner) {
        var _this = _super.call(this, connectionOrQueryBuilder, queryRunner) || this;
        _this.expressionMap.aliasNamePrefixingEnabled = false;
        return _this;
    }
    // -------------------------------------------------------------------------
    // Public Implemented Methods
    // -------------------------------------------------------------------------
    /**
     * Gets generated sql query without parameters being replaced.
     */
    UpdateQueryBuilder.prototype.getQuery = function () {
        var sql = this.createUpdateExpression();
        sql += this.createOrderByExpression();
        sql += this.createLimitExpression();
        return sql.trim();
    };
    /**
     * Optional returning/output clause.
     */
    UpdateQueryBuilder.prototype.output = function (output) {
        return this.returning(output);
    };
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    /**
     * Values needs to be updated.
     */
    UpdateQueryBuilder.prototype.set = function (values) {
        this.expressionMap.valuesSet = values;
        return this;
    };
    /**
     * Sets WHERE condition in the query builder.
     * If you had previously WHERE expression defined,
     * calling this function will override previously set WHERE conditions.
     * Additionally you can add parameters used in where expression.
     */
    UpdateQueryBuilder.prototype.where = function (where, parameters) {
        this.expressionMap.wheres = []; // don't move this block below since computeWhereParameter can add where expressions
        var condition = this.computeWhereParameter(where);
        if (condition)
            this.expressionMap.wheres = [{ type: "simple", condition: condition }];
        if (parameters)
            this.setParameters(parameters);
        return this;
    };
    /**
     * Adds new AND WHERE condition in the query builder.
     * Additionally you can add parameters used in where expression.
     */
    UpdateQueryBuilder.prototype.andWhere = function (where, parameters) {
        this.expressionMap.wheres.push({ type: "and", condition: this.computeWhereParameter(where) });
        if (parameters)
            this.setParameters(parameters);
        return this;
    };
    /**
     * Adds new OR WHERE condition in the query builder.
     * Additionally you can add parameters used in where expression.
     */
    UpdateQueryBuilder.prototype.orWhere = function (where, parameters) {
        this.expressionMap.wheres.push({ type: "or", condition: this.computeWhereParameter(where) });
        if (parameters)
            this.setParameters(parameters);
        return this;
    };
    /**
     * Adds new AND WHERE with conditions for the given ids.
     */
    UpdateQueryBuilder.prototype.whereInIds = function (ids) {
        ids = ids instanceof Array ? ids : [ids];
        var _a = this.createWhereIdsExpression(ids), whereExpression = _a[0], parameters = _a[1];
        this.where(whereExpression, parameters);
        return this;
    };
    /**
     * Adds new AND WHERE with conditions for the given ids.
     */
    UpdateQueryBuilder.prototype.andWhereInIds = function (ids) {
        ids = ids instanceof Array ? ids : [ids];
        var _a = this.createWhereIdsExpression(ids), whereExpression = _a[0], parameters = _a[1];
        this.andWhere(whereExpression, parameters);
        return this;
    };
    /**
     * Adds new OR WHERE with conditions for the given ids.
     */
    UpdateQueryBuilder.prototype.orWhereInIds = function (ids) {
        ids = ids instanceof Array ? ids : [ids];
        var _a = this.createWhereIdsExpression(ids), whereExpression = _a[0], parameters = _a[1];
        this.orWhere(whereExpression, parameters);
        return this;
    };
    /**
     * Sets ORDER BY condition in the query builder.
     * If you had previously ORDER BY expression defined,
     * calling this function will override previously set ORDER BY conditions.
     */
    UpdateQueryBuilder.prototype.orderBy = function (sort, order, nulls) {
        if (order === void 0) { order = "ASC"; }
        if (sort) {
            if (sort instanceof Object) {
                this.expressionMap.orderBys = sort;
            }
            else {
                if (nulls) {
                    this.expressionMap.orderBys = (_a = {}, _a[sort] = { order: order, nulls: nulls }, _a);
                }
                else {
                    this.expressionMap.orderBys = (_b = {}, _b[sort] = order, _b);
                }
            }
        }
        else {
            this.expressionMap.orderBys = {};
        }
        return this;
        var _a, _b;
    };
    /**
     * Adds ORDER BY condition in the query builder.
     */
    UpdateQueryBuilder.prototype.addOrderBy = function (sort, order, nulls) {
        if (order === void 0) { order = "ASC"; }
        if (nulls) {
            this.expressionMap.orderBys[sort] = { order: order, nulls: nulls };
        }
        else {
            this.expressionMap.orderBys[sort] = order;
        }
        return this;
    };
    /**
     * Sets LIMIT - maximum number of rows to be selected.
     */
    UpdateQueryBuilder.prototype.limit = function (limit) {
        this.expressionMap.limit = limit;
        return this;
    };
    /**
     * Optional returning/output clause.
     */
    UpdateQueryBuilder.prototype.returning = function (returning) {
        if (this.connection.driver instanceof SqlServerDriver_1.SqlServerDriver || this.connection.driver instanceof PostgresDriver_1.PostgresDriver) {
            this.expressionMap.returning = returning;
            return this;
        }
        else
            throw new Error("OUTPUT or RETURNING clause only supported by MS SQLServer or PostgreSQL");
    };
    // -------------------------------------------------------------------------
    // Protected Methods
    // -------------------------------------------------------------------------
    /**
     * Creates UPDATE express used to perform insert query.
     */
    UpdateQueryBuilder.prototype.createUpdateExpression = function () {
        var _this = this;
        var valuesSet = this.getValueSet();
        var metadata = this.expressionMap.mainAlias.hasMetadata ? this.expressionMap.mainAlias.metadata : undefined;
        // prepare columns and values to be updated
        var updateColumnAndValues = [];
        if (metadata) {
            EntityMetadataUtils_1.EntityMetadataUtils.createPropertyPath(metadata, valuesSet).forEach(function (propertyPath) {
                // todo: make this and other query builder to work with properly with tables without metadata
                var column = metadata.findColumnWithPropertyPath(propertyPath);
                // we update an entity and entity can contain property which aren't columns, so we just skip them
                if (!column)
                    return;
                var paramName = "_updated_" + column.databaseName;
                var value = _this.connection.driver.preparePersistentValue(column.getEntityValue(valuesSet), column);
                // todo: duplication zone
                if (value instanceof Function) { // support for SQL expressions in update query
                    updateColumnAndValues.push(_this.escape(column.databaseName) + " = " + value());
                }
                else {
                    if (_this.connection.driver instanceof SqlServerDriver_1.SqlServerDriver) {
                        _this.setParameter(paramName, _this.connection.driver.parametrizeValue(column, value));
                    }
                    else {
                        _this.setParameter(paramName, value);
                    }
                    updateColumnAndValues.push(_this.escape(column.databaseName) + " = :" + paramName);
                }
            });
        }
        else {
            Object.keys(valuesSet).map(function (key) {
                var value = valuesSet[key];
                // todo: duplication zone
                if (value instanceof Function) { // support for SQL expressions in update query
                    updateColumnAndValues.push(_this.escape(key) + " = " + value());
                }
                else {
                    updateColumnAndValues.push(_this.escape(key) + " = :" + key);
                    _this.setParameter(key, value);
                }
            });
        }
        // get a table name and all column database names
        var whereExpression = this.createWhereExpression();
        // generate and return sql update query
        if (this.expressionMap.returning !== "" && this.connection.driver instanceof PostgresDriver_1.PostgresDriver) {
            return "UPDATE " + this.getTableName(this.getMainTableName()) + " SET " + updateColumnAndValues.join(", ") + whereExpression + " RETURNING " + this.expressionMap.returning;
        }
        else if (this.expressionMap.returning !== "" && this.connection.driver instanceof SqlServerDriver_1.SqlServerDriver) {
            return "UPDATE " + this.getTableName(this.getMainTableName()) + " SET " + updateColumnAndValues.join(", ") + " OUTPUT " + this.expressionMap.returning + whereExpression;
        }
        else {
            return "UPDATE " + this.getTableName(this.getMainTableName()) + " SET " + updateColumnAndValues.join(", ") + whereExpression; // todo: how do we replace aliases in where to nothing?
        }
    };
    /**
     * Creates "ORDER BY" part of SQL query.
     */
    UpdateQueryBuilder.prototype.createOrderByExpression = function () {
        var _this = this;
        var orderBys = this.expressionMap.orderBys;
        if (Object.keys(orderBys).length > 0)
            return " ORDER BY " + Object.keys(orderBys)
                .map(function (columnName) {
                if (typeof orderBys[columnName] === "string") {
                    return _this.replacePropertyNames(columnName) + " " + orderBys[columnName];
                }
                else {
                    return _this.replacePropertyNames(columnName) + " " + orderBys[columnName].order + " " + orderBys[columnName].nulls;
                }
            })
                .join(", ");
        return "";
    };
    /**
     * Creates "LIMIT" parts of SQL query.
     */
    UpdateQueryBuilder.prototype.createLimitExpression = function () {
        var limit = this.expressionMap.limit;
        if (limit) {
            if (this.connection.driver instanceof MysqlDriver_1.MysqlDriver) {
                return " LIMIT " + limit;
            }
            else {
                throw new LimitOnUpdateNotSupportedError_1.LimitOnUpdateNotSupportedError();
            }
        }
        return "";
    };
    /**
     * Gets array of values need to be inserted into the target table.
     */
    UpdateQueryBuilder.prototype.getValueSet = function () {
        if (this.expressionMap.valuesSet instanceof Object)
            return this.expressionMap.valuesSet;
        throw new Error("Cannot perform update query because update values are not defined. Call \"qb.set(...)\" method to specify inserted values.");
    };
    return UpdateQueryBuilder;
}(QueryBuilder_1.QueryBuilder));
exports.UpdateQueryBuilder = UpdateQueryBuilder;

//# sourceMappingURL=UpdateQueryBuilder.js.map
