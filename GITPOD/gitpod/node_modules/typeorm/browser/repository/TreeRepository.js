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
import { Repository } from "./Repository";
/**
 * Repository with additional functions to work with trees.
 *
 * @see Repository
 */
var TreeRepository = /** @class */ (function (_super) {
    __extends(TreeRepository, _super);
    function TreeRepository() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // todo: implement moving
    // todo: implement removing
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    /**
     * Gets complete trees for all roots in the table.
     */
    TreeRepository.prototype.findTrees = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var roots;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.findRoots()];
                    case 1:
                        roots = _a.sent();
                        return [4 /*yield*/, Promise.all(roots.map(function (root) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.findDescendantsTree(root)];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); }))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, roots];
                }
            });
        });
    };
    /**
     * Roots are entities that have no ancestors. Finds them all.
     */
    TreeRepository.prototype.findRoots = function () {
        var _this = this;
        var escapeAlias = function (alias) { return _this.manager.connection.driver.escape(alias); };
        var escapeColumn = function (column) { return _this.manager.connection.driver.escape(column); };
        var parentPropertyName = this.manager.connection.namingStrategy.joinColumnName(this.metadata.treeParentRelation.propertyName, "id");
        return this.createQueryBuilder("treeEntity")
            .where(escapeAlias("treeEntity") + "." + escapeColumn(parentPropertyName) + " IS NULL")
            .getMany();
    };
    /**
     * Gets all children (descendants) of the given entity. Returns them all in a flat array.
     */
    TreeRepository.prototype.findDescendants = function (entity) {
        return this
            .createDescendantsQueryBuilder("treeEntity", "treeClosure", entity)
            .getMany();
    };
    /**
     * Gets all children (descendants) of the given entity. Returns them in a tree - nested into each other.
     */
    TreeRepository.prototype.findDescendantsTree = function (entity) {
        var _this = this;
        // todo: throw exception if there is no column of this relation?
        return this
            .createDescendantsQueryBuilder("treeEntity", "treeClosure", entity)
            .getRawAndEntities()
            .then(function (entitiesAndScalars) {
            var relationMaps = _this.createRelationMaps("treeEntity", entitiesAndScalars.raw);
            _this.buildChildrenEntityTree(entity, entitiesAndScalars.entities, relationMaps);
            return entity;
        });
    };
    /**
     * Gets number of descendants of the entity.
     */
    TreeRepository.prototype.countDescendants = function (entity) {
        return this
            .createDescendantsQueryBuilder("treeEntity", "treeClosure", entity)
            .getCount();
    };
    /**
     * Creates a query builder used to get descendants of the entities in a tree.
     */
    TreeRepository.prototype.createDescendantsQueryBuilder = function (alias, closureTableAlias, entity) {
        var _this = this;
        // create shortcuts for better readability
        var escape = function (alias) { return _this.manager.connection.driver.escape(alias); };
        var joinCondition = escape(alias) + "." + escape(this.metadata.primaryColumns[0].databaseName) + "=" + escape(closureTableAlias) + "." + escape("descendant");
        return this.createQueryBuilder(alias)
            .innerJoin(this.metadata.closureJunctionTable.tableName, closureTableAlias, joinCondition)
            .where(escape(closureTableAlias) + "." + escape("ancestor") + "=" + this.metadata.getEntityIdMap(entity)[this.metadata.primaryColumns[0].propertyName]);
    };
    /**
     * Gets all parents (ancestors) of the given entity. Returns them all in a flat array.
     */
    TreeRepository.prototype.findAncestors = function (entity) {
        return this
            .createAncestorsQueryBuilder("treeEntity", "treeClosure", entity)
            .getMany();
    };
    /**
     * Gets all parents (ancestors) of the given entity. Returns them in a tree - nested into each other.
     */
    TreeRepository.prototype.findAncestorsTree = function (entity) {
        var _this = this;
        // todo: throw exception if there is no column of this relation?
        return this
            .createAncestorsQueryBuilder("treeEntity", "treeClosure", entity)
            .getRawAndEntities()
            .then(function (entitiesAndScalars) {
            var relationMaps = _this.createRelationMaps("treeEntity", entitiesAndScalars.raw);
            _this.buildParentEntityTree(entity, entitiesAndScalars.entities, relationMaps);
            return entity;
        });
    };
    /**
     * Gets number of ancestors of the entity.
     */
    TreeRepository.prototype.countAncestors = function (entity) {
        return this
            .createAncestorsQueryBuilder("treeEntity", "treeClosure", entity)
            .getCount();
    };
    /**
     * Creates a query builder used to get ancestors of the entities in the tree.
     */
    TreeRepository.prototype.createAncestorsQueryBuilder = function (alias, closureTableAlias, entity) {
        var _this = this;
        // create shortcuts for better readability
        var escapeAlias = function (alias) { return _this.manager.connection.driver.escape(alias); };
        var escapeColumn = function (column) { return _this.manager.connection.driver.escape(column); };
        var joinCondition = escapeAlias(alias) + "." + escapeColumn(this.metadata.primaryColumns[0].databaseName) + "=" + escapeAlias(closureTableAlias) + "." + escapeColumn("ancestor");
        return this.createQueryBuilder(alias)
            .innerJoin(this.metadata.closureJunctionTable.tableName, closureTableAlias, joinCondition)
            .where(escapeAlias(closureTableAlias) + "." + escapeColumn("descendant") + "=" + this.metadata.getEntityIdMap(entity)[this.metadata.primaryColumns[0].propertyName]);
    };
    /**
     * Moves entity to the children of then given entity.
     *
    move(entity: Entity, to: Entity): Promise<void> {
        return Promise.resolve();
    } */
    // -------------------------------------------------------------------------
    // Protected Methods
    // -------------------------------------------------------------------------
    TreeRepository.prototype.createRelationMaps = function (alias, rawResults) {
        var _this = this;
        return rawResults.map(function (rawResult) {
            return {
                id: rawResult[alias + "_" + _this.metadata.primaryColumns[0].databaseName],
                parentId: rawResult[alias + "_" + _this.metadata.treeParentRelation.joinColumns[0].givenDatabaseName]
            };
        });
    };
    TreeRepository.prototype.buildChildrenEntityTree = function (entity, entities, relationMaps) {
        var _this = this;
        var childProperty = this.metadata.treeChildrenRelation.propertyName;
        var parentEntityId = this.metadata.primaryColumns[0].getEntityValue(entity);
        var childRelationMaps = relationMaps.filter(function (relationMap) { return relationMap.parentId === parentEntityId; });
        var childIds = childRelationMaps.map(function (relationMap) { return relationMap.id; });
        entity[childProperty] = entities.filter(function (entity) { return childIds.indexOf(entity.id) !== -1; });
        entity[childProperty].forEach(function (childEntity) {
            _this.buildChildrenEntityTree(childEntity, entities, relationMaps);
        });
    };
    TreeRepository.prototype.buildParentEntityTree = function (entity, entities, relationMaps) {
        var _this = this;
        var parentProperty = this.metadata.treeParentRelation.propertyName;
        var entityId = this.metadata.primaryColumns[0].getEntityValue(entity);
        var parentRelationMap = relationMaps.find(function (relationMap) { return relationMap.id === entityId; });
        var parentEntity = entities.find(function (entity) {
            if (!parentRelationMap)
                return false;
            return entity[_this.metadata.primaryColumns[0].propertyName] === parentRelationMap.parentId;
        });
        if (parentEntity) {
            entity[parentProperty] = parentEntity;
            this.buildParentEntityTree(entity[parentProperty], entities, relationMaps);
        }
    };
    return TreeRepository;
}(Repository));
export { TreeRepository };

//# sourceMappingURL=TreeRepository.js.map
