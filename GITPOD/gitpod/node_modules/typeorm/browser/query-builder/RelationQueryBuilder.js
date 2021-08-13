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
import { QueryBuilder } from "./QueryBuilder";
import { RelationUpdater } from "./RelationUpdater";
import { RelationRemover } from "./RelationRemover";
import { RelationLoader } from "./RelationLoader";
/**
 * Allows to work with entity relations and perform specific operations with those relations.
 *
 * todo: add transactions everywhere
 */
var RelationQueryBuilder = /** @class */ (function (_super) {
    __extends(RelationQueryBuilder, _super);
    function RelationQueryBuilder() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // -------------------------------------------------------------------------
    // Public Implemented Methods
    // -------------------------------------------------------------------------
    /**
     * Gets generated sql query without parameters being replaced.
     */
    RelationQueryBuilder.prototype.getQuery = function () {
        return "";
    };
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    /**
     * Sets entity (target) which relations will be updated.
     */
    RelationQueryBuilder.prototype.of = function (entity) {
        this.expressionMap.of = entity;
        return this;
    };
    /**
     * Sets entity relation's value.
     * Value can be entity, entity id or entity id map (if entity has composite ids).
     * Works only for many-to-one and one-to-one relations.
     * For many-to-many and one-to-many relations use #add and #remove methods instead.
     */
    RelationQueryBuilder.prototype.set = function (value) {
        return __awaiter(this, void 0, void 0, function () {
            var relation, updater;
            return __generator(this, function (_a) {
                relation = this.expressionMap.relationMetadata;
                if (!this.expressionMap.of) // todo: move this check before relation query builder creation?
                    throw new Error("Entity whose relation needs to be set is not set. Use .of method to define whose relation you want to set.");
                if (relation.isManyToMany || relation.isOneToMany)
                    throw new Error("Set operation is only supported for many-to-one and one-to-one relations. " +
                        ("However given \"" + relation.propertyPath + "\" has " + relation.relationType + " relation. ") +
                        "Use .add() method instead.");
                // if there are multiple join columns then user must send id map as "value" argument. check if he really did it
                if (relation.joinColumns &&
                    relation.joinColumns.length > 1 &&
                    (!(value instanceof Object) || Object.keys(value).length < relation.joinColumns.length))
                    throw new Error("Value to be set into the relation must be a map of relation ids, for example: .set({ firstName: \"...\", lastName: \"...\" })");
                updater = new RelationUpdater(this, this.expressionMap);
                return [2 /*return*/, updater.update(value)];
            });
        });
    };
    /**
     * Adds (binds) given value to entity relation.
     * Value can be entity, entity id or entity id map (if entity has composite ids).
     * Value also can be array of entities, array of entity ids or array of entity id maps (if entity has composite ids).
     * Works only for many-to-many and one-to-many relations.
     * For many-to-one and one-to-one use #set method instead.
     */
    RelationQueryBuilder.prototype.add = function (value) {
        return __awaiter(this, void 0, void 0, function () {
            var relation, updater;
            return __generator(this, function (_a) {
                if (value instanceof Array && value.length === 0)
                    return [2 /*return*/];
                relation = this.expressionMap.relationMetadata;
                if (!this.expressionMap.of) // todo: move this check before relation query builder creation?
                    throw new Error("Entity whose relation needs to be set is not set. Use .of method to define whose relation you want to set.");
                if (relation.isManyToOne || relation.isOneToOne)
                    throw new Error("Add operation is only supported for many-to-many and one-to-many relations. " +
                        ("However given \"" + relation.propertyPath + "\" has " + relation.relationType + " relation. ") +
                        "Use .set() method instead.");
                // if there are multiple join columns then user must send id map as "value" argument. check if he really did it
                if (relation.joinColumns &&
                    relation.joinColumns.length > 1 &&
                    (!(value instanceof Object) || Object.keys(value).length < relation.joinColumns.length))
                    throw new Error("Value to be set into the relation must be a map of relation ids, for example: .set({ firstName: \"...\", lastName: \"...\" })");
                updater = new RelationUpdater(this, this.expressionMap);
                return [2 /*return*/, updater.update(value)];
            });
        });
    };
    /**
     * Removes (unbinds) given value from entity relation.
     * Value can be entity, entity id or entity id map (if entity has composite ids).
     * Value also can be array of entities, array of entity ids or array of entity id maps (if entity has composite ids).
     * Works only for many-to-many and one-to-many relations.
     * For many-to-one and one-to-one use #set method instead.
     */
    RelationQueryBuilder.prototype.remove = function (value) {
        return __awaiter(this, void 0, void 0, function () {
            var relation, remover;
            return __generator(this, function (_a) {
                if (value instanceof Array && value.length === 0)
                    return [2 /*return*/];
                relation = this.expressionMap.relationMetadata;
                if (!this.expressionMap.of) // todo: move this check before relation query builder creation?
                    throw new Error("Entity whose relation needs to be set is not set. Use .of method to define whose relation you want to set.");
                if (relation.isManyToOne || relation.isOneToOne)
                    throw new Error("Add operation is only supported for many-to-many and one-to-many relations. " +
                        ("However given \"" + relation.propertyPath + "\" has " + relation.relationType + " relation. ") +
                        "Use .set(null) method instead.");
                remover = new RelationRemover(this, this.expressionMap);
                return [2 /*return*/, remover.remove(value)];
            });
        });
    };
    /**
     * Adds (binds) and removes (unbinds) given values to/from entity relation.
     * Value can be entity, entity id or entity id map (if entity has composite ids).
     * Value also can be array of entities, array of entity ids or array of entity id maps (if entity has composite ids).
     * Works only for many-to-many and one-to-many relations.
     * For many-to-one and one-to-one use #set method instead.
     */
    RelationQueryBuilder.prototype.addAndRemove = function (added, removed) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.remove(removed)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.add(added)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Gets entity's relation id.
    async getId(): Promise<any> {

    }*/
    /**
     * Gets entity's relation ids.
    async getIds(): Promise<any[]> {
        return [];
    }*/
    /**
     * Loads a single entity (relational) from the relation.
     * You can also provide id of relational entity to filter by.
     */
    RelationQueryBuilder.prototype.loadOne = function () {
        return __awaiter(this, void 0, void 0, function () {
            var of, metadata, relationLoader;
            return __generator(this, function (_a) {
                of = this.expressionMap.of;
                if (!(of instanceof Object)) {
                    metadata = this.expressionMap.mainAlias.metadata;
                    if (metadata.hasMultiplePrimaryKeys)
                        throw new Error("Cannot load entity because only one primary key was specified, however entity contains multiple primary keys");
                    of = metadata.primaryColumns[0].createValueMap(of);
                }
                relationLoader = new RelationLoader(this.connection);
                return [2 /*return*/, relationLoader.load(this.expressionMap.relationMetadata, of)];
            });
        });
    };
    /**
     * Loads many entities (relational) from the relation.
     * You can also provide ids of relational entities to filter by.
     */
    RelationQueryBuilder.prototype.loadMany = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.loadOne()];
            });
        });
    };
    return RelationQueryBuilder;
}(QueryBuilder));
export { RelationQueryBuilder };

//# sourceMappingURL=RelationQueryBuilder.js.map
