"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var RelationCountLoader = /** @class */ (function () {
    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    function RelationCountLoader(connection, queryRunner, relationCountAttributes) {
        this.connection = connection;
        this.queryRunner = queryRunner;
        this.relationCountAttributes = relationCountAttributes;
    }
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    RelationCountLoader.prototype.load = function (rawEntities) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var promises;
            return __generator(this, function (_a) {
                promises = this.relationCountAttributes.map(function (relationCountAttr) { return __awaiter(_this, void 0, void 0, function () {
                    var relation, inverseRelation, referenceColumnName_1, inverseSideTable, inverseSideTableName, inverseSideTableAlias, inverseSidePropertyName, referenceColumnValues, qb, _a, joinTableColumnName_1, inverseJoinColumnName, firstJunctionColumn, secondJunctionColumn, referenceColumnValues, junctionAlias, inverseSideTableName, inverseSideTableAlias, junctionTableName, condition, qb, _b;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                if (!relationCountAttr.relation.isOneToMany) return [3 /*break*/, 2];
                                relation = relationCountAttr.relation;
                                inverseRelation = relation.inverseRelation;
                                referenceColumnName_1 = inverseRelation.joinColumns[0].referencedColumn.propertyName;
                                inverseSideTable = relation.inverseEntityMetadata.target;
                                inverseSideTableName = relation.inverseEntityMetadata.tableName;
                                inverseSideTableAlias = relationCountAttr.alias || inverseSideTableName;
                                inverseSidePropertyName = inverseRelation.propertyName;
                                referenceColumnValues = rawEntities
                                    .map(function (rawEntity) { return rawEntity[relationCountAttr.parentAlias + "_" + referenceColumnName_1]; })
                                    .filter(function (value) { return !!value; });
                                // ensure we won't perform redundant queries for joined data which was not found in selection
                                // example: if post.category was not found in db then no need to execute query for category.imageIds
                                if (referenceColumnValues.length === 0)
                                    return [2 /*return*/, { relationCountAttribute: relationCountAttr, results: [] }];
                                qb = this.connection.createQueryBuilder(this.queryRunner);
                                qb.select(inverseSideTableAlias + "." + inverseSidePropertyName, "parentId")
                                    .addSelect("COUNT(*)", "cnt")
                                    .from(inverseSideTable, inverseSideTableAlias)
                                    .where(inverseSideTableAlias + "." + inverseSidePropertyName + " IN (:ids)")
                                    .addGroupBy(inverseSideTableAlias + "." + inverseSidePropertyName)
                                    .setParameter("ids", referenceColumnValues);
                                // apply condition (custom query builder factory)
                                if (relationCountAttr.queryBuilderFactory)
                                    relationCountAttr.queryBuilderFactory(qb);
                                _a = {
                                    relationCountAttribute: relationCountAttr
                                };
                                return [4 /*yield*/, qb.getRawMany()];
                            case 1: return [2 /*return*/, (_a.results = _c.sent(),
                                    _a)];
                            case 2:
                                inverseJoinColumnName = void 0;
                                firstJunctionColumn = void 0;
                                secondJunctionColumn = void 0;
                                if (relationCountAttr.relation.isOwning) { // todo fix joinColumns[0] and inverseJoinColumns[0].
                                    joinTableColumnName_1 = relationCountAttr.relation.joinColumns[0].referencedColumn.databaseName;
                                    inverseJoinColumnName = relationCountAttr.relation.inverseJoinColumns[0].referencedColumn.databaseName;
                                    firstJunctionColumn = relationCountAttr.relation.junctionEntityMetadata.columns[0];
                                    secondJunctionColumn = relationCountAttr.relation.junctionEntityMetadata.columns[1];
                                }
                                else {
                                    joinTableColumnName_1 = relationCountAttr.relation.inverseRelation.inverseJoinColumns[0].referencedColumn.databaseName;
                                    inverseJoinColumnName = relationCountAttr.relation.inverseRelation.joinColumns[0].referencedColumn.databaseName;
                                    firstJunctionColumn = relationCountAttr.relation.junctionEntityMetadata.columns[1];
                                    secondJunctionColumn = relationCountAttr.relation.junctionEntityMetadata.columns[0];
                                }
                                referenceColumnValues = rawEntities
                                    .map(function (rawEntity) { return rawEntity[relationCountAttr.parentAlias + "_" + joinTableColumnName_1]; })
                                    .filter(function (value) { return value; });
                                // ensure we won't perform redundant queries for joined data which was not found in selection
                                // example: if post.category was not found in db then no need to execute query for category.imageIds
                                if (referenceColumnValues.length === 0)
                                    return [2 /*return*/, { relationCountAttribute: relationCountAttr, results: [] }];
                                junctionAlias = relationCountAttr.junctionAlias;
                                inverseSideTableName = relationCountAttr.joinInverseSideMetadata.tableName;
                                inverseSideTableAlias = relationCountAttr.alias || inverseSideTableName;
                                junctionTableName = relationCountAttr.relation.junctionEntityMetadata.tableName;
                                condition = junctionAlias + "." + firstJunctionColumn.propertyName + " IN (" + referenceColumnValues + ")" +
                                    " AND " + junctionAlias + "." + secondJunctionColumn.propertyName + " = " + inverseSideTableAlias + "." + inverseJoinColumnName;
                                qb = this.connection.createQueryBuilder(this.queryRunner);
                                qb.select(junctionAlias + "." + firstJunctionColumn.propertyName, "parentId")
                                    .addSelect("COUNT(" + qb.escape(inverseSideTableAlias) + "." + qb.escape(inverseJoinColumnName) + ")", "cnt")
                                    .from(inverseSideTableName, inverseSideTableAlias)
                                    .innerJoin(junctionTableName, junctionAlias, condition)
                                    .addGroupBy(junctionAlias + "." + firstJunctionColumn.propertyName);
                                // apply condition (custom query builder factory)
                                if (relationCountAttr.queryBuilderFactory)
                                    relationCountAttr.queryBuilderFactory(qb);
                                _b = {
                                    relationCountAttribute: relationCountAttr
                                };
                                return [4 /*yield*/, qb.getRawMany()];
                            case 3: return [2 /*return*/, (_b.results = _c.sent(),
                                    _b)];
                        }
                    });
                }); });
                return [2 /*return*/, Promise.all(promises)];
            });
        });
    };
    return RelationCountLoader;
}());
exports.RelationCountLoader = RelationCountLoader;

//# sourceMappingURL=RelationCountLoader.js.map
