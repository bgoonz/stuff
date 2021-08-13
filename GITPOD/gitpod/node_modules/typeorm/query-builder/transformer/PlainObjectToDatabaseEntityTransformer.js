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
 */
var LoadMapItem = /** @class */ (function () {
    function LoadMapItem(plainEntity, metadata, parentLoadMapItem, relation) {
        this.plainEntity = plainEntity;
        this.metadata = metadata;
        this.parentLoadMapItem = parentLoadMapItem;
        this.relation = relation;
    }
    Object.defineProperty(LoadMapItem.prototype, "target", {
        get: function () {
            return this.metadata.target;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LoadMapItem.prototype, "id", {
        get: function () {
            return this.metadata.getEntityIdMixedMap(this.plainEntity);
        },
        enumerable: true,
        configurable: true
    });
    LoadMapItem.prototype.compareEntities = function (entity1, entity2) {
        return this.metadata.compareEntities(entity1, entity2);
    };
    return LoadMapItem;
}());
var LoadMap = /** @class */ (function () {
    function LoadMap() {
        this.loadMapItems = [];
    }
    Object.defineProperty(LoadMap.prototype, "mainLoadMapItem", {
        get: function () {
            return this.loadMapItems.find(function (item) { return !item.relation && !item.parentLoadMapItem; });
        },
        enumerable: true,
        configurable: true
    });
    LoadMap.prototype.addLoadMap = function (newLoadMap) {
        var item = this.loadMapItems.find(function (item) { return item.target === newLoadMap.target && item.id === newLoadMap.id; });
        if (!item)
            this.loadMapItems.push(newLoadMap);
    };
    LoadMap.prototype.fillEntities = function (target, entities) {
        var _this = this;
        entities.forEach(function (entity) {
            var item = _this.loadMapItems.find(function (loadMapItem) {
                return loadMapItem.target === target && loadMapItem.compareEntities(entity, loadMapItem.plainEntity);
            });
            if (item)
                item.entity = entity;
        });
    };
    LoadMap.prototype.groupByTargetIds = function () {
        var groups = [];
        this.loadMapItems.forEach(function (loadMapItem) {
            var group = groups.find(function (group) { return group.target === loadMapItem.target; });
            if (!group) {
                group = { target: loadMapItem.target, ids: [] };
                groups.push(group);
            }
            group.ids.push(loadMapItem.id);
        });
        return groups;
    };
    return LoadMap;
}());
/**
 * Transforms plain old javascript object
 * Entity is constructed based on its entity metadata.
 */
var PlainObjectToDatabaseEntityTransformer = /** @class */ (function () {
    function PlainObjectToDatabaseEntityTransformer(manager) {
        this.manager = manager;
    }
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    PlainObjectToDatabaseEntityTransformer.prototype.transform = function (plainObject, metadata) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var loadMap, fillLoadMap;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // if plain object does not have id then nothing to load really
                        if (!metadata.checkIfObjectContainsAllPrimaryKeys(plainObject))
                            return [2 /*return*/, Promise.reject("Given object does not have a primary column, cannot transform it to database entity.")];
                        loadMap = new LoadMap();
                        fillLoadMap = function (entity, entityMetadata, parentLoadMapItem, relation) {
                            var item = new LoadMapItem(entity, entityMetadata, parentLoadMapItem, relation);
                            loadMap.addLoadMap(item);
                            entityMetadata
                                .extractRelationValuesFromEntity(entity, metadata.relations)
                                .filter(function (value) { return value !== null && value !== undefined; })
                                .forEach(function (_a) {
                                var relation = _a[0], value = _a[1], inverseEntityMetadata = _a[2];
                                return fillLoadMap(value, inverseEntityMetadata, item, relation);
                            });
                        };
                        fillLoadMap(plainObject, metadata);
                        // load all entities and store them in the load map
                        return [4 /*yield*/, Promise.all(loadMap.groupByTargetIds().map(function (targetWithIds) {
                                return _this.manager
                                    .findByIds(targetWithIds.target, targetWithIds.ids)
                                    .then(function (entities) { return loadMap.fillEntities(targetWithIds.target, entities); });
                            }))];
                    case 1:
                        // load all entities and store them in the load map
                        _a.sent();
                        // go through each item in the load map and set their entity relationship using metadata stored in load map
                        loadMap.loadMapItems.forEach(function (loadMapItem) {
                            if (!loadMapItem.relation ||
                                !loadMapItem.entity ||
                                !loadMapItem.parentLoadMapItem ||
                                !loadMapItem.parentLoadMapItem.entity)
                                return;
                            if (loadMapItem.relation.isManyToMany || loadMapItem.relation.isOneToMany) {
                                if (!loadMapItem.parentLoadMapItem.entity[loadMapItem.relation.propertyName])
                                    loadMapItem.parentLoadMapItem.entity[loadMapItem.relation.propertyName] = [];
                                loadMapItem.parentLoadMapItem.entity[loadMapItem.relation.propertyName].push(loadMapItem.entity);
                            }
                            else {
                                loadMapItem.parentLoadMapItem.entity[loadMapItem.relation.propertyName] = loadMapItem.entity;
                            }
                        });
                        return [2 /*return*/, loadMap.mainLoadMapItem ? loadMap.mainLoadMapItem.entity : undefined];
                }
            });
        });
    };
    return PlainObjectToDatabaseEntityTransformer;
}());
exports.PlainObjectToDatabaseEntityTransformer = PlainObjectToDatabaseEntityTransformer;

//# sourceMappingURL=PlainObjectToDatabaseEntityTransformer.js.map
