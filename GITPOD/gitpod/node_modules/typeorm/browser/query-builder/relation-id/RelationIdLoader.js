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
var RelationIdLoader = /** @class */ (function () {
    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    function RelationIdLoader(connection, queryRunner, relationIdAttributes) {
        this.connection = connection;
        this.queryRunner = queryRunner;
        this.relationIdAttributes = relationIdAttributes;
    }
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    RelationIdLoader.prototype.load = function (rawEntities) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var promises;
            return __generator(this, function (_a) {
                promises = this.relationIdAttributes.map(function (relationIdAttr) { return __awaiter(_this, void 0, void 0, function () {
                    var results, relation, joinColumns_1, table, tableName, tableAlias_1, parameters_1, condition, qb_1, _a, relation, joinColumns_2, inverseJoinColumns, junctionAlias_1, inverseSideTableName, inverseSideTableAlias_1, junctionTableName, mappedColumns, parameters_2, joinColumnConditions, inverseJoinColumnCondition_1, condition, qb_2, _b;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                if (!(relationIdAttr.relation.isManyToOne || relationIdAttr.relation.isOneToOneOwner)) return [3 /*break*/, 1];
                                // example: Post and Tag
                                // loadRelationIdAndMap("post.tagId", "post.tag")
                                // we expect it to load id of tag
                                if (relationIdAttr.queryBuilderFactory)
                                    throw new Error("Additional condition can not be used with ManyToOne or OneToOne owner relations.");
                                results = rawEntities.map(function (rawEntity) {
                                    var result = {};
                                    relationIdAttr.relation.joinColumns.forEach(function (joinColumn) {
                                        result[joinColumn.databaseName] = rawEntity[relationIdAttr.parentAlias + "_" + joinColumn.databaseName];
                                    });
                                    relationIdAttr.relation.entityMetadata.primaryColumns.forEach(function (primaryColumn) {
                                        result[primaryColumn.databaseName] = rawEntity[relationIdAttr.parentAlias + "_" + primaryColumn.databaseName];
                                    });
                                    return result;
                                });
                                return [2 /*return*/, {
                                        relationIdAttribute: relationIdAttr,
                                        results: results
                                    }];
                            case 1:
                                if (!(relationIdAttr.relation.isOneToMany || relationIdAttr.relation.isOneToOneNotOwner)) return [3 /*break*/, 3];
                                relation = relationIdAttr.relation;
                                joinColumns_1 = relation.isOwning ? relation.joinColumns : relation.inverseRelation.joinColumns;
                                table = relation.inverseEntityMetadata.target;
                                tableName = relation.inverseEntityMetadata.tableName;
                                tableAlias_1 = relationIdAttr.alias || tableName;
                                parameters_1 = {};
                                condition = rawEntities.map(function (rawEntity, index) {
                                    return joinColumns_1.map(function (joinColumn) {
                                        var parameterName = joinColumn.databaseName + index;
                                        parameters_1[parameterName] = rawEntity[relationIdAttr.parentAlias + "_" + joinColumn.referencedColumn.databaseName];
                                        return tableAlias_1 + "." + joinColumn.propertyPath + " = :" + parameterName;
                                    }).join(" AND ");
                                }).map(function (condition) { return "(" + condition + ")"; })
                                    .join(" OR ");
                                // ensure we won't perform redundant queries for joined data which was not found in selection
                                // example: if post.category was not found in db then no need to execute query for category.imageIds
                                if (!condition)
                                    return [2 /*return*/, { relationIdAttribute: relationIdAttr, results: [] }];
                                qb_1 = this.connection.createQueryBuilder(this.queryRunner);
                                joinColumns_1.forEach(function (joinColumn) {
                                    qb_1.addSelect(tableAlias_1 + "." + joinColumn.propertyPath, joinColumn.databaseName);
                                });
                                relation.inverseRelation.entityMetadata.primaryColumns.forEach(function (primaryColumn) {
                                    qb_1.addSelect(tableAlias_1 + "." + primaryColumn.propertyPath, primaryColumn.databaseName);
                                });
                                qb_1.from(table, tableAlias_1)
                                    .where("(" + condition + ")") // need brackets because if we have additional condition and no brackets, it looks like (a = 1) OR (a = 2) AND b = 1, that is incorrect
                                    .setParameters(parameters_1);
                                // apply condition (custom query builder factory)
                                if (relationIdAttr.queryBuilderFactory)
                                    relationIdAttr.queryBuilderFactory(qb_1);
                                _a = {
                                    relationIdAttribute: relationIdAttr
                                };
                                return [4 /*yield*/, qb_1.getRawMany()];
                            case 2: return [2 /*return*/, (_a.results = _c.sent(),
                                    _a)];
                            case 3:
                                relation = relationIdAttr.relation;
                                joinColumns_2 = relation.isOwning ? relation.joinColumns : relation.inverseRelation.inverseJoinColumns;
                                inverseJoinColumns = relation.isOwning ? relation.inverseJoinColumns : relation.inverseRelation.joinColumns;
                                junctionAlias_1 = relationIdAttr.junctionAlias;
                                inverseSideTableName = relationIdAttr.joinInverseSideMetadata.tableName;
                                inverseSideTableAlias_1 = relationIdAttr.alias || inverseSideTableName;
                                junctionTableName = relation.isOwning ? relation.junctionEntityMetadata.tableName : relation.inverseRelation.junctionEntityMetadata.tableName;
                                mappedColumns = rawEntities.map(function (rawEntity) {
                                    return joinColumns_2.reduce(function (map, joinColumn) {
                                        map[joinColumn.propertyPath] = rawEntity[relationIdAttr.parentAlias + "_" + joinColumn.referencedColumn.databaseName];
                                        return map;
                                    }, {});
                                });
                                // ensure we won't perform redundant queries for joined data which was not found in selection
                                // example: if post.category was not found in db then no need to execute query for category.imageIds
                                if (mappedColumns.length === 0)
                                    return [2 /*return*/, { relationIdAttribute: relationIdAttr, results: [] }];
                                parameters_2 = {};
                                joinColumnConditions = mappedColumns.map(function (mappedColumn, index) {
                                    return Object.keys(mappedColumn).map(function (key) {
                                        var parameterName = key + index;
                                        parameters_2[parameterName] = mappedColumn[key];
                                        return junctionAlias_1 + "." + key + " = :" + parameterName;
                                    }).join(" AND ");
                                });
                                inverseJoinColumnCondition_1 = inverseJoinColumns.map(function (joinColumn) {
                                    return junctionAlias_1 + "." + joinColumn.propertyPath + " = " + inverseSideTableAlias_1 + "." + joinColumn.referencedColumn.propertyPath;
                                }).join(" AND ");
                                condition = joinColumnConditions.map(function (condition) {
                                    return "(" + condition + " AND " + inverseJoinColumnCondition_1 + ")";
                                }).join(" OR ");
                                qb_2 = this.connection.createQueryBuilder(this.queryRunner);
                                inverseJoinColumns.forEach(function (joinColumn) {
                                    qb_2.addSelect(junctionAlias_1 + "." + joinColumn.propertyPath, joinColumn.databaseName)
                                        .addOrderBy(junctionAlias_1 + "." + joinColumn.propertyPath);
                                });
                                joinColumns_2.forEach(function (joinColumn) {
                                    qb_2.addSelect(junctionAlias_1 + "." + joinColumn.propertyPath, joinColumn.databaseName)
                                        .addOrderBy(junctionAlias_1 + "." + joinColumn.propertyPath);
                                });
                                qb_2.from(inverseSideTableName, inverseSideTableAlias_1)
                                    .innerJoin(junctionTableName, junctionAlias_1, condition)
                                    .setParameters(parameters_2);
                                // apply condition (custom query builder factory)
                                if (relationIdAttr.queryBuilderFactory)
                                    relationIdAttr.queryBuilderFactory(qb_2);
                                _b = {
                                    relationIdAttribute: relationIdAttr
                                };
                                return [4 /*yield*/, qb_2.getRawMany()];
                            case 4: return [2 /*return*/, (_b.results = _c.sent(),
                                    _b)];
                        }
                    });
                }); });
                return [2 /*return*/, Promise.all(promises)];
            });
        });
    };
    return RelationIdLoader;
}());
export { RelationIdLoader };

//# sourceMappingURL=RelationIdLoader.js.map
