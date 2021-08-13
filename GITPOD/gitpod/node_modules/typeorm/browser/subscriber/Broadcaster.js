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
import { EventListenerTypes } from "../metadata/types/EventListenerTypes";
/**
 * Broadcaster provides a helper methods to broadcast events to the subscribers.
 */
var Broadcaster = /** @class */ (function () {
    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    function Broadcaster(connection) {
        this.connection = connection;
    }
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    /**
     * Broadcasts "BEFORE_INSERT", "BEFORE_UPDATE", "BEFORE_REMOVE" events for all given subjects.
     */
    Broadcaster.prototype.broadcastBeforeEventsForAll = function (entityManager, insertSubjects, updateSubjects, removeSubjects) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var insertPromises, updatePromises, removePromises, allPromises;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        insertPromises = insertSubjects.map(function (subject) { return _this.broadcastBeforeInsertEvent(entityManager, subject); });
                        updatePromises = updateSubjects.map(function (subject) { return _this.broadcastBeforeUpdateEvent(entityManager, subject); });
                        removePromises = removeSubjects.map(function (subject) { return _this.broadcastBeforeRemoveEvent(entityManager, subject); });
                        allPromises = insertPromises.concat(updatePromises).concat(removePromises);
                        return [4 /*yield*/, Promise.all(allPromises)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Broadcasts "AFTER_INSERT", "AFTER_UPDATE", "AFTER_REMOVE" events for all given subjects.
     */
    Broadcaster.prototype.broadcastAfterEventsForAll = function (entityManager, insertSubjects, updateSubjects, removeSubjects) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var insertPromises, updatePromises, removePromises, allPromises;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        insertPromises = insertSubjects.map(function (subject) { return _this.broadcastAfterInsertEvent(entityManager, subject); });
                        updatePromises = updateSubjects.map(function (subject) { return _this.broadcastAfterUpdateEvent(entityManager, subject); });
                        removePromises = removeSubjects.map(function (subject) { return _this.broadcastAfterRemoveEvent(entityManager, subject); });
                        allPromises = insertPromises.concat(updatePromises).concat(removePromises);
                        return [4 /*yield*/, Promise.all(allPromises)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Broadcasts "BEFORE_INSERT" event.
     * Before insert event is executed before entity is being inserted to the database for the first time.
     * All subscribers and entity listeners who listened to this event will be executed at this point.
     * Subscribers and entity listeners can return promises, it will wait until they are resolved.
     */
    Broadcaster.prototype.broadcastBeforeInsertEvent = function (manager, subject) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var listeners, subscribers;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        listeners = subject.metadata.listeners
                            .filter(function (listener) { return listener.type === EventListenerTypes.BEFORE_INSERT && listener.isAllowed(subject.entity); })
                            .map(function (entityListener) { return entityListener.execute(subject.entity); });
                        subscribers = this.connection.subscribers
                            .filter(function (subscriber) { return _this.isAllowedSubscriber(subscriber, subject.entityTarget) && subscriber.beforeInsert; })
                            .map(function (subscriber) { return subscriber.beforeInsert({
                            manager: manager,
                            entity: subject.entity
                        }); });
                        return [4 /*yield*/, Promise.all(listeners.concat(subscribers))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Broadcasts "BEFORE_UPDATE" event.
     * Before update event is executed before entity is being updated in the database.
     * All subscribers and entity listeners who listened to this event will be executed at this point.
     * Subscribers and entity listeners can return promises, it will wait until they are resolved.
     */
    Broadcaster.prototype.broadcastBeforeUpdateEvent = function (manager, subject) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var listeners, subscribers;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        listeners = subject.metadata.listeners
                            .filter(function (listener) { return listener.type === EventListenerTypes.BEFORE_UPDATE && listener.isAllowed(subject.entity); })
                            .map(function (entityListener) { return entityListener.execute(subject.entity); });
                        subscribers = this.connection.subscribers
                            .filter(function (subscriber) { return _this.isAllowedSubscriber(subscriber, subject.entityTarget) && subscriber.beforeUpdate; })
                            .map(function (subscriber) { return subscriber.beforeUpdate({
                            manager: manager,
                            entity: subject.entity,
                            databaseEntity: subject.databaseEntity,
                            updatedColumns: subject.diffColumns,
                            updatedRelations: subject.diffRelations,
                        }); });
                        return [4 /*yield*/, Promise.all(listeners.concat(subscribers))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Broadcasts "BEFORE_REMOVE" event.
     * Before remove event is executed before entity is being removed from the database.
     * All subscribers and entity listeners who listened to this event will be executed at this point.
     * Subscribers and entity listeners can return promises, it will wait until they are resolved.
     */
    Broadcaster.prototype.broadcastBeforeRemoveEvent = function (manager, subject) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var listeners, subscribers;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        listeners = subject.metadata.listeners
                            .filter(function (listener) { return listener.type === EventListenerTypes.BEFORE_REMOVE && listener.isAllowed(subject.entity); })
                            .map(function (entityListener) { return entityListener.execute(subject.databaseEntity); });
                        subscribers = this.connection.subscribers
                            .filter(function (subscriber) { return _this.isAllowedSubscriber(subscriber, subject.entityTarget) && subscriber.beforeRemove; })
                            .map(function (subscriber) { return subscriber.beforeRemove({
                            manager: manager,
                            entity: subject.hasEntity ? subject.entity : undefined,
                            databaseEntity: subject.databaseEntity,
                            entityId: subject.metadata.getEntityIdMixedMap(subject.databaseEntity)
                        }); });
                        return [4 /*yield*/, Promise.all(listeners.concat(subscribers))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Broadcasts "AFTER_INSERT" event.
     * After insert event is executed after entity is being persisted to the database for the first time.
     * All subscribers and entity listeners who listened to this event will be executed at this point.
     * Subscribers and entity listeners can return promises, it will wait until they are resolved.
     */
    Broadcaster.prototype.broadcastAfterInsertEvent = function (manager, subject) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var listeners, subscribers;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        listeners = subject.metadata.listeners
                            .filter(function (listener) { return listener.type === EventListenerTypes.AFTER_INSERT && listener.isAllowed(subject.entity); })
                            .map(function (entityListener) { return entityListener.execute(subject.entity); });
                        subscribers = this.connection.subscribers
                            .filter(function (subscriber) { return _this.isAllowedSubscriber(subscriber, subject.entityTarget) && subscriber.afterInsert; })
                            .map(function (subscriber) { return subscriber.afterInsert({
                            manager: manager,
                            entity: subject.entity
                        }); });
                        return [4 /*yield*/, Promise.all(listeners.concat(subscribers))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Broadcasts "AFTER_UPDATE" event.
     * After update event is executed after entity is being updated in the database.
     * All subscribers and entity listeners who listened to this event will be executed at this point.
     * Subscribers and entity listeners can return promises, it will wait until they are resolved.
     */
    Broadcaster.prototype.broadcastAfterUpdateEvent = function (manager, subject) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var listeners, subscribers;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        listeners = subject.metadata.listeners
                            .filter(function (listener) { return listener.type === EventListenerTypes.AFTER_UPDATE && listener.isAllowed(subject.entity); })
                            .map(function (entityListener) { return entityListener.execute(subject.entity); });
                        subscribers = this.connection.subscribers
                            .filter(function (subscriber) { return _this.isAllowedSubscriber(subscriber, subject.entityTarget) && subscriber.afterUpdate; })
                            .map(function (subscriber) { return subscriber.afterUpdate({
                            manager: manager,
                            entity: subject.entity,
                            databaseEntity: subject.databaseEntity,
                            updatedColumns: subject.diffColumns,
                            updatedRelations: subject.diffRelations,
                        }); });
                        return [4 /*yield*/, Promise.all(listeners.concat(subscribers))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Broadcasts "AFTER_REMOVE" event.
     * After remove event is executed after entity is being removed from the database.
     * All subscribers and entity listeners who listened to this event will be executed at this point.
     * Subscribers and entity listeners can return promises, it will wait until they are resolved.
     */
    Broadcaster.prototype.broadcastAfterRemoveEvent = function (manager, subject) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var listeners, subscribers;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        listeners = subject.metadata.listeners
                            .filter(function (listener) { return listener.type === EventListenerTypes.AFTER_REMOVE && listener.isAllowed(subject.entity); })
                            .map(function (entityListener) { return entityListener.execute(subject.entity); });
                        subscribers = this.connection.subscribers
                            .filter(function (subscriber) { return _this.isAllowedSubscriber(subscriber, subject.entityTarget) && subscriber.afterRemove; })
                            .map(function (subscriber) { return subscriber.afterRemove({
                            manager: manager,
                            entity: subject.hasEntity ? subject.entity : undefined,
                            databaseEntity: subject.databaseEntity,
                            entityId: subject.metadata.getEntityIdMixedMap(subject.databaseEntity)
                        }); });
                        return [4 /*yield*/, Promise.all(listeners.concat(subscribers))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Broadcasts "AFTER_LOAD" event for all given entities, and their sub-entities.
     * After load event is executed after entity has been loaded from the database.
     * All subscribers and entity listeners who listened to this event will be executed at this point.
     * Subscribers and entity listeners can return promises, it will wait until they are resolved.
     */
    Broadcaster.prototype.broadcastLoadEventsForAll = function (target, entities) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.all(entities.map(function (entity) { return _this.broadcastLoadEvents(target, entity); }))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Broadcasts "AFTER_LOAD" event for the given entity and all its sub-entities.
     * After load event is executed after entity has been loaded from the database.
     * All subscribers and entity listeners who listened to this event will be executed at this point.
     * Subscribers and entity listeners can return promises, it will wait until they are resolved.
     */
    Broadcaster.prototype.broadcastLoadEvents = function (target, entity) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var children, listeners, subscribers;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (entity instanceof Promise) // todo: check why need this?
                            return [2 /*return*/];
                        children = this.connection.getMetadata(target).relations.reduce(function (promises, relation) {
                            // in lazy relations we cannot simply access to entity property because it will cause a getter and a database query
                            if (relation.isLazy) {
                                if (!entity.hasOwnProperty(relation.propertyName))
                                    return promises;
                            }
                            else {
                                if (entity[relation.propertyName] === null || entity[relation.propertyName] === undefined)
                                    return promises;
                            }
                            var value = relation.getEntityValue(entity);
                            if (value instanceof Array) {
                                promises = promises.concat(_this.broadcastLoadEventsForAll(relation.inverseEntityMetadata.target, value));
                            }
                            else if (value) {
                                promises.push(_this.broadcastLoadEvents(relation.inverseEntityMetadata.target, value));
                            }
                            return promises;
                        }, []);
                        listeners = this.connection.getMetadata(target).listeners
                            .filter(function (listener) { return listener.type === EventListenerTypes.AFTER_LOAD && listener.isAllowed(entity); })
                            .map(function (listener) { return entity[listener.propertyName](); });
                        subscribers = this.connection.subscribers
                            .filter(function (subscriber) { return _this.isAllowedSubscriber(subscriber, target) && subscriber.afterLoad; })
                            .map(function (subscriber) { return subscriber.afterLoad(entity); });
                        return [4 /*yield*/, Promise.all(children.concat(listeners.concat(subscribers)))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // -------------------------------------------------------------------------
    // Protected Methods
    // -------------------------------------------------------------------------
    /**
     * Checks if subscriber's methods can be executed by checking if its don't listen to the particular entity,
     * or listens our entity.
     */
    Broadcaster.prototype.isAllowedSubscriber = function (subscriber, target) {
        return !subscriber.listenTo ||
            !subscriber.listenTo() ||
            subscriber.listenTo() === Object ||
            subscriber.listenTo() === target ||
            subscriber.listenTo().isPrototypeOf(target);
    };
    return Broadcaster;
}());
export { Broadcaster };

//# sourceMappingURL=Broadcaster.js.map
