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
/**
 * Allows to work with entity relations and perform specific operations with those relations.
 *
 * todo: add transactions everywhere
 */
var RelationUpdater = /** @class */ (function () {
    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    function RelationUpdater(queryBuilder, expressionMap) {
        this.queryBuilder = queryBuilder;
        this.expressionMap = expressionMap;
    }
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    /**
     * Performs set or add operation on a relation.
     */
    RelationUpdater.prototype.update = function (value) {
        return __awaiter(this, void 0, void 0, function () {
            var relation, updateSet, updateSet_1, ofs, parameters_1, conditions_1, condition, of_1, updateSet, junctionMetadata_1, ofs, values, firstColumnValues, secondColumnValues_1, bulkInserted_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        relation = this.expressionMap.relationMetadata;
                        if (!(relation.isManyToOne || relation.isOneToOneOwner)) return [3 /*break*/, 2];
                        updateSet = relation.joinColumns.reduce(function (updateSet, joinColumn) {
                            var relationValue = value instanceof Object ? joinColumn.referencedColumn.getEntityValue(value) : value;
                            joinColumn.setEntityValue(updateSet, relationValue);
                            return updateSet;
                        }, {});
                        if (!this.expressionMap.of || (this.expressionMap.of instanceof Array && !this.expressionMap.of.length))
                            return [2 /*return*/];
                        return [4 /*yield*/, this.queryBuilder
                                .createQueryBuilder()
                                .update(relation.entityMetadata.target)
                                .set(updateSet)
                                .whereInIds(this.expressionMap.of)
                                .execute()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 8];
                    case 2:
                        if (!((relation.isOneToOneNotOwner || relation.isOneToMany) && value === null)) return [3 /*break*/, 4];
                        updateSet_1 = {};
                        relation.inverseRelation.joinColumns.forEach(function (column) {
                            updateSet_1[column.propertyName] = null;
                        });
                        ofs = this.expressionMap.of instanceof Array ? this.expressionMap.of : [this.expressionMap.of];
                        parameters_1 = {};
                        conditions_1 = [];
                        ofs.forEach(function (of, ofIndex) {
                            relation.inverseRelation.joinColumns.map(function (column, columnIndex) {
                                var parameterName = "joinColumn_" + ofIndex + "_" + columnIndex;
                                parameters_1[parameterName] = of instanceof Object ? column.referencedColumn.getEntityValue(of) : of;
                                conditions_1.push(column.propertyPath + " = :" + parameterName);
                            });
                        });
                        condition = conditions_1.map(function (str) { return "(" + str + ")"; }).join(" OR ");
                        if (!condition)
                            return [2 /*return*/];
                        return [4 /*yield*/, this.queryBuilder
                                .createQueryBuilder()
                                .update(relation.inverseEntityMetadata.target)
                                .set(updateSet_1)
                                .where(condition)
                                .setParameters(parameters_1)
                                .execute()];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 8];
                    case 4:
                        if (!(relation.isOneToOneNotOwner || relation.isOneToMany)) return [3 /*break*/, 6];
                        if (this.expressionMap.of instanceof Array)
                            throw new Error("You cannot update relations of multiple entities with the same related object. Provide a single entity into .of method.");
                        of_1 = this.expressionMap.of;
                        updateSet = relation.inverseRelation.joinColumns.reduce(function (updateSet, joinColumn) {
                            var relationValue = of_1 instanceof Object ? joinColumn.referencedColumn.getEntityValue(of_1) : of_1;
                            joinColumn.setEntityValue(updateSet, relationValue);
                            return updateSet;
                        }, {});
                        if (!value || (value instanceof Array && !value.length))
                            return [2 /*return*/];
                        return [4 /*yield*/, this.queryBuilder
                                .createQueryBuilder()
                                .update(relation.inverseEntityMetadata.target)
                                .set(updateSet)
                                .whereInIds(value)
                                .execute()];
                    case 5:
                        _a.sent();
                        return [3 /*break*/, 8];
                    case 6:
                        junctionMetadata_1 = relation.junctionEntityMetadata;
                        ofs = this.expressionMap.of instanceof Array ? this.expressionMap.of : [this.expressionMap.of];
                        values = value instanceof Array ? value : [value];
                        firstColumnValues = relation.isManyToManyOwner ? ofs : values;
                        secondColumnValues_1 = relation.isManyToManyOwner ? values : ofs;
                        bulkInserted_1 = [];
                        firstColumnValues.forEach(function (firstColumnVal) {
                            secondColumnValues_1.forEach(function (secondColumnVal) {
                                var inserted = {};
                                junctionMetadata_1.ownerColumns.forEach(function (column) {
                                    inserted[column.databaseName] = firstColumnVal instanceof Object ? column.referencedColumn.getEntityValue(firstColumnVal) : firstColumnVal;
                                });
                                junctionMetadata_1.inverseColumns.forEach(function (column) {
                                    inserted[column.databaseName] = secondColumnVal instanceof Object ? column.referencedColumn.getEntityValue(secondColumnVal) : secondColumnVal;
                                });
                                bulkInserted_1.push(inserted);
                            });
                        });
                        if (!bulkInserted_1.length)
                            return [2 /*return*/];
                        return [4 /*yield*/, this.queryBuilder
                                .createQueryBuilder()
                                .insert()
                                .into(junctionMetadata_1.tableName)
                                .values(bulkInserted_1)
                                .execute()];
                    case 7:
                        _a.sent();
                        _a.label = 8;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    return RelationUpdater;
}());
exports.RelationUpdater = RelationUpdater;

//# sourceMappingURL=RelationUpdater.js.map
