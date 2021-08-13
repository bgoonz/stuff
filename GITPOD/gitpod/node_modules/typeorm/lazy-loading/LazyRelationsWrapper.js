"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RelationLoader_1 = require("../query-builder/RelationLoader");
/**
 * Wraps entities and creates getters/setters for their relations
 * to be able to lazily load relations when accessing these relations.
 */
var LazyRelationsWrapper = /** @class */ (function () {
    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    function LazyRelationsWrapper(connection) {
        this.connection = connection;
    }
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    /**
     * Wraps given entity and creates getters/setters for its given relation
     * to be able to lazily load data when accessing these relation.
     */
    LazyRelationsWrapper.prototype.wrap = function (object, relation) {
        var relationLoader = new RelationLoader_1.RelationLoader(this.connection);
        var dataIndex = "__" + relation.propertyName + "__"; // in what property of the entity loaded data will be stored
        var promiseIndex = "__promise_" + relation.propertyName + "__"; // in what property of the entity loading promise will be stored
        var resolveIndex = "__has_" + relation.propertyName + "__"; // indicates if relation data already was loaded or not, we need this flag if loaded data is empty
        Object.defineProperty(object, relation.propertyName, {
            get: function () {
                var _this = this;
                if (this[resolveIndex] === true) // if related data already was loaded then simply return it
                    return Promise.resolve(this[dataIndex]);
                if (this[promiseIndex]) // if related data is loading then return a promise relationLoader loads it
                    return this[promiseIndex];
                // nothing is loaded yet, load relation data and save it in the model once they are loaded
                this[promiseIndex] = relationLoader.load(relation, this).then(function (result) {
                    _this[dataIndex] = result;
                    _this[resolveIndex] = true;
                    delete _this[promiseIndex];
                    return _this[dataIndex];
                }); // .catch((err: any) => { throw err; });
                return this[promiseIndex];
            },
            set: function (promise) {
                var _this = this;
                if (promise instanceof Promise) { // if set data is a promise then wait for its resolve and save in the object
                    promise.then(function (result) {
                        _this[dataIndex] = result;
                        _this[resolveIndex] = true;
                    });
                }
                else { // if its direct data set (non promise, probably not safe-typed)
                    this[dataIndex] = promise;
                    this[resolveIndex] = true;
                }
            },
            configurable: true
        });
    };
    return LazyRelationsWrapper;
}());
exports.LazyRelationsWrapper = LazyRelationsWrapper;

//# sourceMappingURL=LazyRelationsWrapper.js.map
