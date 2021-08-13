var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { QueryExpressionMap } from "./QueryExpressionMap";
import { Brackets } from "./Brackets";
import { EntityMetadataUtils } from "../metadata/EntityMetadataUtils";
import { SqljsDriver } from "../driver/sqljs/SqljsDriver";
// todo: completely cover query builder with tests
// todo: entityOrProperty can be target name. implement proper behaviour if it is.
// todo: check in persistment if id exist on object and throw exception (can be in partial selection?)
// todo: fix problem with long aliases eg getMaxIdentifierLength
// todo: fix replacing in .select("COUNT(post.id) AS cnt") statement
// todo: implement joinAlways in relations and relationId
// todo: finish partial selection
// todo: sugar methods like: .addCount and .selectCount, selectCountAndMap, selectSum, selectSumAndMap, ...
// todo: implement @Select decorator
// todo: add select and map functions
// todo: implement relation/entity loading and setting them into properties within a separate query
// .loadAndMap("post.categories", "post.categories", qb => ...)
// .loadAndMap("post.categories", Category, qb => ...)
/**
 * Allows to build complex sql queries in a fashion way and execute those queries.
 */
var QueryBuilder = /** @class */ (function () {
    /**
     * QueryBuilder can be initialized from given Connection and QueryRunner objects or from given other QueryBuilder.
     */
    function QueryBuilder(connectionOrQueryBuilder, queryRunner) {
        if (connectionOrQueryBuilder instanceof QueryBuilder) {
            this.connection = connectionOrQueryBuilder.connection;
            this.queryRunner = connectionOrQueryBuilder.queryRunner;
            this.expressionMap = connectionOrQueryBuilder.expressionMap.clone();
        }
        else {
            this.connection = connectionOrQueryBuilder;
            this.queryRunner = queryRunner;
            this.expressionMap = new QueryExpressionMap(this.connection);
        }
    }
    Object.defineProperty(QueryBuilder.prototype, "alias", {
        // -------------------------------------------------------------------------
        // Accessors
        // -------------------------------------------------------------------------
        /**
         * Gets the main alias string used in this query builder.
         */
        get: function () {
            if (!this.expressionMap.mainAlias)
                throw new Error("Main alias is not set"); // todo: better exception
            return this.expressionMap.mainAlias.name;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Creates SELECT query and selects given data.
     * Replaces all previous selections if they exist.
     */
    QueryBuilder.prototype.select = function (selection, selectionAliasName) {
        this.expressionMap.queryType = "select";
        if (selection instanceof Array) {
            this.expressionMap.selects = selection.map(function (selection) { return ({ selection: selection }); });
        }
        else if (selection) {
            this.expressionMap.selects = [{ selection: selection, aliasName: selectionAliasName }];
        }
        // loading it dynamically because of circular issue
        var SelectQueryBuilderCls = require("./SelectQueryBuilder").SelectQueryBuilder;
        if (this instanceof SelectQueryBuilderCls)
            return this;
        return new SelectQueryBuilderCls(this);
    };
    /**
     * Creates INSERT query.
     */
    QueryBuilder.prototype.insert = function () {
        this.expressionMap.queryType = "insert";
        // loading it dynamically because of circular issue
        var InsertQueryBuilderCls = require("./InsertQueryBuilder").InsertQueryBuilder;
        if (this instanceof InsertQueryBuilderCls)
            return this;
        return new InsertQueryBuilderCls(this);
    };
    /**
     * Creates UPDATE query and applies given update values.
     */
    QueryBuilder.prototype.update = function (entityOrTableNameUpdateSet, maybeUpdateSet) {
        var updateSet = maybeUpdateSet ? maybeUpdateSet : entityOrTableNameUpdateSet;
        if (entityOrTableNameUpdateSet instanceof Function || typeof entityOrTableNameUpdateSet === "string") {
            var mainAlias = this.createFromAlias(entityOrTableNameUpdateSet);
            this.expressionMap.setMainAlias(mainAlias);
        }
        this.expressionMap.queryType = "update";
        this.expressionMap.valuesSet = updateSet;
        // loading it dynamically because of circular issue
        var UpdateQueryBuilderCls = require("./UpdateQueryBuilder").UpdateQueryBuilder;
        if (this instanceof UpdateQueryBuilderCls)
            return this;
        return new UpdateQueryBuilderCls(this);
    };
    /**
     * Creates DELETE query.
     */
    QueryBuilder.prototype.delete = function () {
        this.expressionMap.queryType = "delete";
        // loading it dynamically because of circular issue
        var DeleteQueryBuilderCls = require("./DeleteQueryBuilder").DeleteQueryBuilder;
        if (this instanceof DeleteQueryBuilderCls)
            return this;
        return new DeleteQueryBuilderCls(this);
    };
    /**
     * Sets entity's relation with which this query builder gonna work.
     */
    QueryBuilder.prototype.relation = function (entityTargetOrPropertyPath, maybePropertyPath) {
        var entityTarget = arguments.length === 2 ? entityTargetOrPropertyPath : undefined;
        var propertyPath = arguments.length === 2 ? maybePropertyPath : entityTargetOrPropertyPath;
        this.expressionMap.queryType = "relation";
        this.expressionMap.relationPropertyPath = propertyPath;
        if (entityTarget) {
            var mainAlias = this.createFromAlias(entityTarget);
            this.expressionMap.setMainAlias(mainAlias);
        }
        // loading it dynamically because of circular issue
        var RelationQueryBuilderCls = require("./RelationQueryBuilder").RelationQueryBuilder;
        if (this instanceof RelationQueryBuilderCls)
            return this;
        return new RelationQueryBuilderCls(this);
    };
    /**
     * Checks if given relation or relations exist in the entity.
     * Returns true if relation exists, false otherwise.
     */
    QueryBuilder.prototype.hasRelation = function (target, relation) {
        var entityMetadata = this.connection.getMetadata(target);
        var relations = relation instanceof Array ? relation : [relation];
        return relations.every(function (relation) {
            return !!entityMetadata.findRelationWithPropertyPath(relation);
        });
    };
    /**
     * Sets parameter name and its value.
     */
    QueryBuilder.prototype.setParameter = function (key, value) {
        this.expressionMap.parameters[key] = value;
        return this;
    };
    /**
     * Adds all parameters from the given object.
     */
    QueryBuilder.prototype.setParameters = function (parameters) {
        var _this = this;
        // set parent query builder parameters as well in sub-query mode
        if (this.expressionMap.parentQueryBuilder)
            this.expressionMap.parentQueryBuilder.setParameters(parameters);
        Object.keys(parameters).forEach(function (key) {
            _this.expressionMap.parameters[key] = parameters[key];
        });
        return this;
    };
    /**
     * Gets all parameters.
     */
    QueryBuilder.prototype.getParameters = function () {
        var parameters = Object.assign({}, this.expressionMap.parameters);
        // add discriminator column parameter if it exist
        if (this.expressionMap.mainAlias && this.expressionMap.mainAlias.hasMetadata) {
            var metadata = this.expressionMap.mainAlias.metadata;
            if (metadata.discriminatorColumn && metadata.parentEntityMetadata) {
                var values = metadata.childEntityMetadatas
                    .filter(function (childMetadata) { return childMetadata.discriminatorColumn; })
                    .map(function (childMetadata) { return childMetadata.discriminatorValue; });
                values.push(metadata.discriminatorValue);
                parameters["discriminatorColumnValues"] = values;
            }
        }
        return parameters;
    };
    /**
     * Gets generated sql that will be executed.
     * Parameters in the query are escaped for the currently used driver.
     */
    QueryBuilder.prototype.getSql = function () {
        return this.connection.driver.escapeQueryWithParameters(this.getQuery(), this.getParameters())[0];
    };
    /**
     * Prints sql to stdout using console.log.
     */
    QueryBuilder.prototype.printSql = function () {
        console.log(this.getSql());
        return this;
    };
    /**
     * Gets query to be executed with all parameters used in it.
     */
    QueryBuilder.prototype.getQueryAndParameters = function () {
        return this.connection.driver.escapeQueryWithParameters(this.getQuery(), this.getParameters());
    };
    /**
     * Executes sql generated by query builder and returns raw database results.
     */
    QueryBuilder.prototype.execute = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, sql, parameters, queryRunner;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this.getQueryAndParameters(), sql = _a[0], parameters = _a[1];
                        queryRunner = this.obtainQueryRunner();
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, , 3, 8]);
                        return [4 /*yield*/, queryRunner.query(sql, parameters)];
                    case 2: return [2 /*return*/, _b.sent()]; // await is needed here because we are using finally
                    case 3:
                        if (!(queryRunner !== this.queryRunner)) return [3 /*break*/, 5];
                        return [4 /*yield*/, queryRunner.release()];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5:
                        if (!(this.connection.driver instanceof SqljsDriver)) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.connection.driver.autoSave()];
                    case 6:
                        _b.sent();
                        _b.label = 7;
                    case 7: return [7 /*endfinally*/];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Creates a completely new query builder.
     * Uses same query runner as current QueryBuilder.
     */
    QueryBuilder.prototype.createQueryBuilder = function () {
        return new this.constructor(this.connection, this.queryRunner);
    };
    /**
     * Clones query builder as it is.
     * Note: it uses new query runner, if you want query builder that uses exactly same query runner,
     * you can create query builder using its constructor, for example new SelectQueryBuilder(queryBuilder)
     * where queryBuilder is cloned QueryBuilder.
     */
    QueryBuilder.prototype.clone = function () {
        return new this.constructor(this);
    };
    /**
     * Disables escaping.
     */
    QueryBuilder.prototype.disableEscaping = function () {
        this.expressionMap.disableEscaping = false;
        return this;
    };
    /**
     * Escapes table name, column name or alias name using current database's escaping character.
     */
    QueryBuilder.prototype.escape = function (name) {
        if (!this.expressionMap.disableEscaping)
            return name;
        return this.connection.driver.escape(name);
    };
    /**
     * Sets or overrides query builder's QueryRunner.
     */
    QueryBuilder.prototype.setQueryRunner = function (queryRunner) {
        this.queryRunner = queryRunner;
        return this;
    };
    // -------------------------------------------------------------------------
    // Protected Methods
    // -------------------------------------------------------------------------
    /**
     * Gets escaped table name with schema name if SqlServer driver used with custom
     * schema name, otherwise returns escaped table name.
     */
    QueryBuilder.prototype.getTableName = function (tablePath) {
        // let tablePath = tableName;
        // const driver = this.connection.driver;
        // const schema = (driver.options as SqlServerConnectionOptions|PostgresConnectionOptions).schema;
        // const metadata = this.connection.hasMetadata(tableName) ? this.connection.getMetadata(tableName) : undefined;
        var _this = this;
        /*if (driver instanceof SqlServerDriver || driver instanceof PostgresDriver || driver instanceof MysqlDriver) {
            if (metadata) {
                if (metadata.schema) {
                    tablePath = `${metadata.schema}.${tableName}`;
                } else if (schema) {
                    tablePath = `${schema}.${tableName}`;
                }

                if (metadata.database && !(driver instanceof PostgresDriver)) {
                    if (!schema && !metadata.schema && driver instanceof SqlServerDriver) {
                        tablePath = `${metadata.database}..${tablePath}`;
                    } else {
                        tablePath = `${metadata.database}.${tablePath}`;
                    }
                }

            } else if (schema) {
                tablePath = `${schema!}.${tableName}`;
            }
        }*/
        return tablePath.split(".")
            .map(function (i) {
            // this condition need because in SQL Server driver when custom database name was specified and schema name was not, we got `dbName..tableName` string, and doesn't need to escape middle empty string
            if (i === "")
                return i;
            return _this.escape(i);
        }).join(".");
    };
    /**
     * Gets name of the table where insert should be performed.
     */
    QueryBuilder.prototype.getMainTableName = function () {
        if (!this.expressionMap.mainAlias)
            throw new Error("Entity where values should be inserted is not specified. Call \"qb.into(entity)\" method to specify it.");
        if (this.expressionMap.mainAlias.hasMetadata)
            return this.expressionMap.mainAlias.metadata.tablePath;
        return this.expressionMap.mainAlias.tablePath;
    };
    /**
     * Specifies FROM which entity's table select/update/delete will be executed.
     * Also sets a main string alias of the selection data.
     */
    QueryBuilder.prototype.createFromAlias = function (entityTarget, aliasName) {
        // if table has a metadata then find it to properly escape its properties
        // const metadata = this.connection.entityMetadatas.find(metadata => metadata.tableName === tableName);
        if (this.connection.hasMetadata(entityTarget)) {
            var metadata = this.connection.getMetadata(entityTarget);
            return this.expressionMap.createAlias({
                type: "from",
                name: aliasName,
                metadata: this.connection.getMetadata(entityTarget),
                tablePath: metadata.tablePath
            });
        }
        else {
            var subQuery = "";
            if (entityTarget instanceof Function) {
                var subQueryBuilder = entityTarget(this.subQuery());
                this.setParameters(subQueryBuilder.getParameters());
                subQuery = subQueryBuilder.getQuery();
            }
            else {
                subQuery = entityTarget;
            }
            var isSubQuery = entityTarget instanceof Function || entityTarget.substr(0, 1) === "(" && entityTarget.substr(-1) === ")";
            return this.expressionMap.createAlias({
                type: "from",
                name: aliasName,
                tablePath: isSubQuery === false ? entityTarget : undefined,
                subQuery: isSubQuery === true ? subQuery : undefined,
            });
        }
    };
    /**
     * Replaces all entity's propertyName to name in the given statement.
     */
    QueryBuilder.prototype.replacePropertyNames = function (statement) {
        var _this = this;
        this.expressionMap.aliases.forEach(function (alias) {
            if (!alias.hasMetadata)
                return;
            var replaceAliasNamePrefix = _this.expressionMap.aliasNamePrefixingEnabled ? alias.name + "\\." : "";
            var replacementAliasNamePrefix = _this.expressionMap.aliasNamePrefixingEnabled ? _this.escape(alias.name) + "." : "";
            alias.metadata.columns.forEach(function (column) {
                var expression = "([ =\(]|^.{0})" + replaceAliasNamePrefix + column.propertyPath + "([ =\)\,]|.{0}$)";
                statement = statement.replace(new RegExp(expression, "gm"), "$1" + replacementAliasNamePrefix + _this.escape(column.databaseName) + "$2");
                var expression2 = "([ =\(]|^.{0})" + replaceAliasNamePrefix + column.propertyName + "([ =\)\,]|.{0}$)";
                statement = statement.replace(new RegExp(expression2, "gm"), "$1" + replacementAliasNamePrefix + _this.escape(column.databaseName) + "$2");
            });
            alias.metadata.relations.forEach(function (relation) {
                relation.joinColumns.concat(relation.inverseJoinColumns).forEach(function (joinColumn) {
                    var expression = "([ =\(]|^.{0})" + replaceAliasNamePrefix + relation.propertyPath + "\\." + joinColumn.referencedColumn.propertyPath + "([ =\)\,]|.{0}$)";
                    statement = statement.replace(new RegExp(expression, "gm"), "$1" + replacementAliasNamePrefix + _this.escape(joinColumn.databaseName) + "$2"); // todo: fix relation.joinColumns[0], what if multiple columns
                });
                if (relation.joinColumns.length > 0) {
                    var expression = "([ =\(]|^.{0})" + replaceAliasNamePrefix + relation.propertyPath + "([ =\)\,]|.{0}$)";
                    statement = statement.replace(new RegExp(expression, "gm"), "$1" + replacementAliasNamePrefix + _this.escape(relation.joinColumns[0].databaseName) + "$2"); // todo: fix relation.joinColumns[0], what if multiple columns
                }
            });
        });
        return statement;
    };
    /**
     * Creates "WHERE" expression.
     */
    QueryBuilder.prototype.createWhereExpression = function () {
        var conditions = this.createWhereExpressionString();
        if (this.expressionMap.mainAlias.hasMetadata) {
            var metadata = this.expressionMap.mainAlias.metadata;
            if (metadata.discriminatorColumn && metadata.parentEntityMetadata) {
                var condition = this.replacePropertyNames(this.expressionMap.mainAlias.name + "." + metadata.discriminatorColumn.databaseName) + " IN (:discriminatorColumnValues)";
                return " WHERE " + (conditions.length ? "(" + conditions + ") AND" : "") + " " + condition;
            }
        }
        if (!conditions.length) // TODO copy in to discriminator condition
            return this.expressionMap.extraAppendedAndWhereCondition ? " WHERE " + this.replacePropertyNames(this.expressionMap.extraAppendedAndWhereCondition) : "";
        if (this.expressionMap.extraAppendedAndWhereCondition)
            return " WHERE (" + conditions + ") AND " + this.replacePropertyNames(this.expressionMap.extraAppendedAndWhereCondition);
        return " WHERE " + conditions;
    };
    /**
     * Concatenates all added where expressions into one string.
     */
    QueryBuilder.prototype.createWhereExpressionString = function () {
        var _this = this;
        return this.expressionMap.wheres.map(function (where, index) {
            switch (where.type) {
                case "and":
                    return (index > 0 ? "AND " : "") + _this.replacePropertyNames(where.condition);
                case "or":
                    return (index > 0 ? "OR " : "") + _this.replacePropertyNames(where.condition);
                default:
                    return _this.replacePropertyNames(where.condition);
            }
        }).join(" ");
    };
    /**
     * Creates "WHERE" expression and variables for the given "ids".
     */
    QueryBuilder.prototype.createWhereIdsExpression = function (ids) {
        var _this = this;
        var metadata = this.expressionMap.mainAlias.metadata;
        // create shortcuts for better readability
        var alias = this.expressionMap.aliasNamePrefixingEnabled ? this.escape(this.expressionMap.mainAlias.name) + "." : "";
        var parameters = {};
        var whereStrings = ids.map(function (id, index) {
            id = id instanceof Object ? id : metadata.createEntityIdMap(id);
            var whereSubStrings = [];
            metadata.primaryColumns.forEach(function (primaryColumn, secondIndex) {
                whereSubStrings.push(alias + _this.escape(primaryColumn.databaseName) + "=:id_" + index + "_" + secondIndex);
                parameters["id_" + index + "_" + secondIndex] = primaryColumn.getEntityValue(id);
            });
            metadata.parentIdColumns.forEach(function (parentIdColumn, secondIndex) {
                whereSubStrings.push(alias + _this.escape(parentIdColumn.databaseName) + "=:parentId_" + index + "_" + secondIndex);
                parameters["parentId_" + index + "_" + secondIndex] = parentIdColumn.getEntityValue(id);
            });
            return whereSubStrings.join(" AND ");
        });
        var whereString = whereStrings.length > 1 ? "(" + whereStrings.join(" OR ") + ")" : whereStrings[0];
        return [whereString, parameters];
    };
    /**
     * Computes given where argument - transforms to a where string all forms it can take.
     */
    QueryBuilder.prototype.computeWhereParameter = function (where) {
        var _this = this;
        if (typeof where === "string")
            return where;
        if (where instanceof Brackets) {
            var whereQueryBuilder = this.createQueryBuilder();
            where.whereFactory(whereQueryBuilder);
            var whereString = whereQueryBuilder.createWhereExpressionString();
            this.setParameters(whereQueryBuilder.getParameters());
            return whereString ? "(" + whereString + ")" : "";
        }
        else if (where instanceof Function) {
            return where(this);
        }
        else if (where instanceof Object) {
            if (this.expressionMap.mainAlias.metadata) {
                var propertyPaths = EntityMetadataUtils.createPropertyPath(this.expressionMap.mainAlias.metadata, where);
                propertyPaths.forEach(function (propertyPath, propertyIndex) {
                    var columns = _this.expressionMap.mainAlias.metadata.findColumnsWithPropertyPath(propertyPath);
                    columns.forEach(function (column, columnIndex) {
                        var parameterValue = column.getEntityValue(where);
                        var aliasPath = _this.expressionMap.aliasNamePrefixingEnabled ? _this.alias + "." + propertyPath : column.propertyPath;
                        if (parameterValue === null) {
                            _this.andWhere(aliasPath + " IS NULL");
                        }
                        else {
                            var parameterName = "where_" + propertyIndex + "_" + columnIndex;
                            _this.andWhere(aliasPath + "=:" + parameterName);
                            _this.setParameter(parameterName, parameterValue);
                        }
                    });
                });
            }
            else {
                Object.keys(where).forEach(function (key, index) {
                    var parameterValue = where[key];
                    var aliasPath = _this.expressionMap.aliasNamePrefixingEnabled ? _this.alias + "." + key : key;
                    if (parameterValue === null) {
                        _this.andWhere(aliasPath + " IS NULL");
                    }
                    else {
                        var parameterName = "where_" + index;
                        _this.andWhere(aliasPath + "=:" + parameterName);
                        _this.setParameter(parameterName, parameterValue);
                    }
                });
            }
        }
        return "";
    };
    /**
     * Creates a query builder used to execute sql queries inside this query builder.
     */
    QueryBuilder.prototype.obtainQueryRunner = function () {
        return this.queryRunner || this.connection.createQueryRunner("master");
    };
    return QueryBuilder;
}());
export { QueryBuilder };

//# sourceMappingURL=QueryBuilder.js.map
