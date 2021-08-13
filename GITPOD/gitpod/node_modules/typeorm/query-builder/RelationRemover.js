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
var RelationRemover = /** @class */ (function () {
    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    function RelationRemover(queryBuilder, expressionMap) {
        this.queryBuilder = queryBuilder;
        this.expressionMap = expressionMap;
    }
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    /**
     * Performs remove operation on a relation.
     */
    RelationRemover.prototype.remove = function (value) {
        return __awaiter(this, void 0, void 0, function () {
            var relation, ofs, values_1, updateSet_1, parameters_1, conditions_1, condition, junctionMetadata_1, ofs, values, firstColumnValues, secondColumnValues_1, parameters_2, conditions_2, condition;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        relation = this.expressionMap.relationMetadata;
                        if (!relation.isOneToMany) return [3 /*break*/, 2];
                        ofs = this.expressionMap.of instanceof Array ? this.expressionMap.of : [this.expressionMap.of];
                        values_1 = value instanceof Array ? value : [value];
                        updateSet_1 = {};
                        relation.inverseRelation.joinColumns.forEach(function (column) {
                            updateSet_1[column.propertyName] = null;
                        });
                        parameters_1 = {};
                        conditions_1 = [];
                        ofs.forEach(function (of, ofIndex) {
                            conditions_1.push.apply(conditions_1, values_1.map(function (value, valueIndex) {
                                return relation.inverseRelation.joinColumns.map(function (column, columnIndex) {
                                    var parameterName = "joinColumn_" + ofIndex + "_" + valueIndex + "_" + columnIndex;
                                    parameters_1[parameterName] = of instanceof Object ? column.referencedColumn.getEntityValue(of) : of;
                                    return column.propertyPath + " = :" + parameterName;
                                }).concat(relation.inverseRelation.entityMetadata.primaryColumns.map(function (column, columnIndex) {
                                    var parameterName = "primaryColumn_" + valueIndex + "_" + valueIndex + "_" + columnIndex;
                                    parameters_1[parameterName] = value instanceof Object ? column.getEntityValue(value) : value;
                                    return column.propertyPath + " = :" + parameterName;
                                })).join(" AND ");
                            }));
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
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2:
                        junctionMetadata_1 = relation.junctionEntityMetadata;
                        ofs = this.expressionMap.of instanceof Array ? this.expressionMap.of : [this.expressionMap.of];
                        values = value instanceof Array ? value : [value];
                        firstColumnValues = relation.isManyToManyOwner ? ofs : values;
                        secondColumnValues_1 = relation.isManyToManyOwner ? values : ofs;
                        parameters_2 = {};
                        conditions_2 = [];
                        firstColumnValues.forEach(function (firstColumnVal, firstColumnValIndex) {
                            conditions_2.push.apply(conditions_2, secondColumnValues_1.map(function (secondColumnVal, secondColumnValIndex) {
                                return junctionMetadata_1.ownerColumns.map(function (column, columnIndex) {
                                    var parameterName = "firstValue_" + firstColumnValIndex + "_" + secondColumnValIndex + "_" + columnIndex;
                                    parameters_2[parameterName] = firstColumnVal instanceof Object ? column.referencedColumn.getEntityValue(firstColumnVal) : firstColumnVal;
                                    return column.databaseName + " = :" + parameterName;
                                }).concat(junctionMetadata_1.inverseColumns.map(function (column, columnIndex) {
                                    var parameterName = "secondValue_" + firstColumnValIndex + "_" + secondColumnValIndex + "_" + columnIndex;
                                    parameters_2[parameterName] = firstColumnVal instanceof Object ? column.referencedColumn.getEntityValue(secondColumnVal) : secondColumnVal;
                                    return column.databaseName + " = :" + parameterName;
                                })).join(" AND ");
                            }));
                        });
                        condition = conditions_2.map(function (str) { return "(" + str + ")"; }).join(" OR ");
                        return [4 /*yield*/, this.queryBuilder
                                .createQueryBuilder()
                                .delete()
                                .from(junctionMetadata_1.tableName)
                                .where(condition)
                                .setParameters(parameters_2)
                                .execute()];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return RelationRemover;
}());
exports.RelationRemover = RelationRemover;

//# sourceMappingURL=RelationRemover.js.map
