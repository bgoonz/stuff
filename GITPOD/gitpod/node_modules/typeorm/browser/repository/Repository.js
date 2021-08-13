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
/**
 * Repository is supposed to work with your entity objects. Find entities, insert, update, delete, etc.
 */
var Repository = /** @class */ (function () {
    function Repository() {
    }
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    /**
     * Creates a new query builder that can be used to build a sql query.
     */
    Repository.prototype.createQueryBuilder = function (alias, queryRunner) {
        return this.manager.createQueryBuilder(this.metadata.target, alias || this.metadata.targetName, queryRunner || this.queryRunner);
    };
    Object.defineProperty(Repository.prototype, "target", {
        /**
         * Returns object that is managed by this repository.
         * If this repository manages entity from schema,
         * then it returns a name of that schema instead.
         */
        get: function () {
            return this.metadata.target;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Checks if entity has an id.
     * If entity composite compose ids, it will check them all.
     */
    Repository.prototype.hasId = function (entity) {
        return this.manager.hasId(this.metadata.target, entity);
    };
    /**
     * Gets entity mixed id.
     */
    Repository.prototype.getId = function (entity) {
        return this.manager.getId(this.metadata.target, entity);
    };
    /**
     * Creates a new entity instance or instances.
     * Can copy properties from the given object into new entities.
     */
    Repository.prototype.create = function (plainEntityLikeOrPlainEntityLikes) {
        return this.manager.create(this.metadata.target, plainEntityLikeOrPlainEntityLikes);
    };
    /**
     * Merges multiple entities (or entity-like objects) into a given entity.
     */
    Repository.prototype.merge = function (mergeIntoEntity) {
        var entityLikes = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            entityLikes[_i - 1] = arguments[_i];
        }
        return (_a = this.manager).merge.apply(_a, [this.metadata.target, mergeIntoEntity].concat(entityLikes));
        var _a;
    };
    /**
     * Creates a new entity from the given plan javascript object. If entity already exist in the database, then
     * it loads it (and everything related to it), replaces all values with the new ones from the given object
     * and returns this new entity. This new entity is actually a loaded from the db entity with all properties
     * replaced from the new object.
     *
     * Note that given entity-like object must have an entity id / primary key to find entity by.
     * Returns undefined if entity with given id was not found.
     */
    Repository.prototype.preload = function (entityLike) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.manager.preload(this.metadata.target, entityLike)];
            });
        });
    };
    /**
     * Saves one or many given entities.
     */
    Repository.prototype.save = function (entityOrEntities, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.manager.save(this.metadata.target, entityOrEntities, options)];
            });
        });
    };
    /**
     * Inserts a given entity into the database.
     * Unlike save method executes a primitive operation without cascades, relations and other operations included.
     * Does not modify source entity and does not execute listeners and subscribers.
     * Executes fast and efficient INSERT query.
     * Does not check if entity exist in the database, so query will fail if duplicate entity is being inserted.
     */
    Repository.prototype.insert = function (entity, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.manager.insert(this.metadata.target, entity, options)];
            });
        });
    };
    /**
     * Updates entity partially. Entity can be found by a given conditions.
     */
    Repository.prototype.update = function (conditions, partialEntity, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.manager.update(this.metadata.target, conditions, partialEntity, options)];
            });
        });
    };
    /**
     * Updates entity partially. Entity will be found by a given id.
     */
    Repository.prototype.updateById = function (id, partialEntity, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.manager.updateById(this.metadata.target, id, partialEntity, options)];
            });
        });
    };
    /**
     * Removes one or many given entities.
     */
    Repository.prototype.remove = function (entityOrEntities, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.manager.remove(this.metadata.target, entityOrEntities, options)];
            });
        });
    };
    /**
     * Deletes entities by a given conditions.
     * Unlike save method executes a primitive operation without cascades, relations and other operations included.
     * Does not modify source entity and does not execute listeners and subscribers.
     * Executes fast and efficient DELETE query.
     * Does not check if entity exist in the database.
     */
    Repository.prototype.delete = function (conditions, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.manager.delete(this.metadata.target, conditions, options)];
            });
        });
    };
    /**
     * Deletes entities by a given conditions.
     * Unlike save method executes a primitive operation without cascades, relations and other operations included.
     * Does not modify source entity and does not execute listeners and subscribers.
     * Executes fast and efficient DELETE query.
     * Does not check if entity exist in the database.
     */
    Repository.prototype.deleteById = function (id, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.manager.deleteById(this.metadata.target, id, options)];
            });
        });
    };
    /**
     * Removes entity by a given entity id.
     *
     * @deprecated use deleteById method instead.
     */
    Repository.prototype.removeById = function (id, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.manager.deleteById(this.metadata.target, id, options)];
            });
        });
    };
    /**
     * Removes entity by a given entity id.
     *
     * @deprecated use deleteById method instead.
     */
    Repository.prototype.removeByIds = function (ids, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.manager.removeByIds(this.metadata.target, ids, options)];
            });
        });
    };
    /**
     * Counts entities that match given find options or conditions.
     */
    Repository.prototype.count = function (optionsOrConditions) {
        return this.manager.count(this.metadata.target, optionsOrConditions);
    };
    /**
     * Finds entities that match given find options or conditions.
     */
    Repository.prototype.find = function (optionsOrConditions) {
        return this.manager.find(this.metadata.target, optionsOrConditions);
    };
    /**
     * Finds entities that match given find options or conditions.
     * Also counts all entities that match given conditions,
     * but ignores pagination settings (from and take options).
     */
    Repository.prototype.findAndCount = function (optionsOrConditions) {
        return this.manager.findAndCount(this.metadata.target, optionsOrConditions);
    };
    /**
     * Finds entities by ids.
     * Optionally find options can be applied.
     */
    Repository.prototype.findByIds = function (ids, optionsOrConditions) {
        return this.manager.findByIds(this.metadata.target, ids, optionsOrConditions);
    };
    /**
     * Finds first entity that matches given conditions.
     */
    Repository.prototype.findOne = function (optionsOrConditions) {
        return this.manager.findOne(this.metadata.target, optionsOrConditions);
    };
    /**
     * Finds entity by given id.
     * Optionally find options or conditions can be applied.
     */
    Repository.prototype.findOneById = function (id, optionsOrConditions) {
        return this.manager.findOneById(this.metadata.target, id, optionsOrConditions);
    };
    /**
     * Executes a raw SQL query and returns a raw database results.
     * Raw query execution is supported only by relational databases (MongoDB is not supported).
     */
    Repository.prototype.query = function (query, parameters) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.manager.query(query, parameters)];
            });
        });
    };
    /**
     * Clears all the data from the given table/collection (truncates/drops it).
     *
     * Note: this method uses TRUNCATE and may not work as you expect in transactions on some platforms.
     * @see https://stackoverflow.com/a/5972738/925151
     */
    Repository.prototype.clear = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.manager.clear(this.metadata.target)];
            });
        });
    };
    return Repository;
}());
export { Repository };

//# sourceMappingURL=Repository.js.map
