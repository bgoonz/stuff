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
import { OrmUtils } from "../util/OrmUtils";
import { PromiseUtils } from "../util/PromiseUtils";
import { MongoDriver } from "../driver/mongodb/MongoDriver";
import { Broadcaster } from "../subscriber/Broadcaster";
/**
 * Executes all database operations (inserts, updated, deletes) that must be executed
 * with given persistence subjects.
 */
var SubjectOperationExecutor = /** @class */ (function () {
    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    function SubjectOperationExecutor(connection, transactionEntityManager, queryRunner, subjects) {
        /*subjects.forEach(subject => {
         console.log(subject.entity);
         console.log("mustBeInserted: ", subject.mustBeInserted);
         console.log("mustBeUpdated: ", subject.mustBeUpdated);
         console.log("mustBeRemoved: ", subject.mustBeRemoved);
         });*/
        this.connection = connection;
        this.transactionEntityManager = transactionEntityManager;
        this.queryRunner = queryRunner;
        // validate all subjects first
        subjects.forEach(function (subject) { return subject.validate(); });
        // set class properties for easy use
        this.allSubjects = subjects;
        this.insertSubjects = subjects.filter(function (subject) { return subject.mustBeInserted; });
        this.updateSubjects = subjects.filter(function (subject) { return subject.mustBeUpdated; });
        this.removeSubjects = subjects.filter(function (subject) { return subject.mustBeRemoved; });
        this.relationUpdateSubjects = subjects.filter(function (subject) { return subject.hasRelationUpdates; });
        this.broadcaster = new Broadcaster(this.connection);
    }
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    SubjectOperationExecutor.prototype.areExecutableOperations = function () {
        return this.insertSubjects.length > 0 ||
            this.updateSubjects.length > 0 ||
            this.removeSubjects.length > 0 ||
            this.relationUpdateSubjects.length > 0 ||
            this.allSubjects.some(function (subject) { return subject.junctionInserts.length > 0; }) ||
            this.allSubjects.some(function (subject) { return subject.junctionRemoves.length > 0; });
    };
    /**
     * Executes all operations over given array of subjects.
     * Executes queries using given query runner.
     */
    SubjectOperationExecutor.prototype.execute = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // broadcast "before" events before we start updating
                    return [4 /*yield*/, this.broadcaster.broadcastBeforeEventsForAll(this.transactionEntityManager, this.insertSubjects, this.updateSubjects, this.removeSubjects)];
                    case 1:
                        // broadcast "before" events before we start updating
                        _a.sent();
                        // since events can trigger some internal changes (for example update depend property) we need to perform some re-computations here
                        this.updateSubjects.forEach(function (subject) { return subject.recompute(); });
                        return [4 /*yield*/, this.executeInsertOperations()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.executeInsertClosureTableOperations()];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.executeInsertJunctionsOperations()];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this.executeRemoveJunctionsOperations()];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, this.executeUpdateOperations()];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, this.executeUpdateRelations()];
                    case 7:
                        _a.sent();
                        return [4 /*yield*/, this.executeRemoveOperations()];
                    case 8:
                        _a.sent();
                        // update all special columns in persisted entities, like inserted id or remove ids from the removed entities
                        return [4 /*yield*/, this.updateSpecialColumnsInPersistedEntities()];
                    case 9:
                        // update all special columns in persisted entities, like inserted id or remove ids from the removed entities
                        _a.sent();
                        // finally broadcast "after" events
                        // todo: THIS SHOULD NOT BE TRUTH: note that we are broadcasting events after commit because we want to have ids of the entities inside them to be available in subscribers
                        return [4 /*yield*/, this.broadcaster.broadcastAfterEventsForAll(this.transactionEntityManager, this.insertSubjects, this.updateSubjects, this.removeSubjects)];
                    case 10:
                        // finally broadcast "after" events
                        // todo: THIS SHOULD NOT BE TRUTH: note that we are broadcasting events after commit because we want to have ids of the entities inside them to be available in subscribers
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // -------------------------------------------------------------------------
    // Private Methods: Insertion
    // -------------------------------------------------------------------------
    /**
     * Executes insert operations.
     *
     * For insertion we separate two groups of entities:
     * - first group of entities are entities which do not have any relations
     *      or entities which do not have any non-nullable relation
     * - second group of entities are entities which does have non-nullable relations
     *
     * Insert process of the entities from the first group which can only have nullable relations are actually a two-step process:
     * - first we insert entities without their relations, explicitly left them NULL
     * - later we update inserted entity once again with id of the object inserted with it
     *
     * Yes, two queries are being executed, but this is by design.
     * There is no better way to solve this problem and others at the same time.
     *
     * Insert process of the entities from the second group which can have only non nullable relations is a single-step process:
     * - we simply insert all entities and get into attention all its dependencies which were inserted in the first group
     */
    SubjectOperationExecutor.prototype.executeInsertOperations = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var firstInsertSubjects, secondInsertSubjects, updatePromises;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        firstInsertSubjects = this.insertSubjects.filter(function (subject) { return !subject.metadata.hasNonNullableRelations; });
                        secondInsertSubjects = this.insertSubjects.filter(function (subject) { return subject.metadata.hasNonNullableRelations; });
                        // note: these operations should be executed in sequence, not in parallel
                        // because second group depend of obtained data from the first group
                        return [4 /*yield*/, Promise.all(firstInsertSubjects.map(function (subject) { return _this.insert(subject, []); }))];
                    case 1:
                        // note: these operations should be executed in sequence, not in parallel
                        // because second group depend of obtained data from the first group
                        _a.sent();
                        return [4 /*yield*/, Promise.all(secondInsertSubjects.map(function (subject) { return _this.insert(subject, firstInsertSubjects); }))];
                    case 2:
                        _a.sent();
                        updatePromises = [];
                        firstInsertSubjects.forEach(function (subject) {
                            // first update relations with join columns (one-to-one owner and many-to-one relations)
                            var updateOptions = {};
                            subject.metadata.relationsWithJoinColumns.forEach(function (relation) {
                                relation.joinColumns.forEach(function (joinColumn) {
                                    var referencedColumn = joinColumn.referencedColumn;
                                    var relatedEntity = relation.getEntityValue(subject.entity);
                                    // if relation value is not set then nothing to do here
                                    if (!relatedEntity)
                                        return;
                                    // check if relation reference column is a relation
                                    var relationId;
                                    var columnRelation = relation.inverseEntityMetadata.findRelationWithPropertyPath(joinColumn.referencedColumn.propertyPath);
                                    if (columnRelation) { // if referenced column is a relation
                                        var insertSubject = _this.insertSubjects.find(function (insertedSubject) { return insertedSubject.entity === referencedColumn.getEntityValue(relatedEntity); });
                                        // if this relation was just inserted
                                        if (insertSubject) {
                                            // check if we have this relation id already
                                            relationId = columnRelation.getEntityValue(referencedColumn.getEntityValue(relatedEntity));
                                            if (!relationId) {
                                                // if we don't have relation id then use special values
                                                if (referencedColumn.isGenerated && insertSubject.generatedMap)
                                                    relationId = referencedColumn.getEntityValue(insertSubject.generatedMap);
                                                // todo: handle other special types too
                                            }
                                        }
                                    }
                                    else { // if referenced column is a simple non relational column
                                        var insertSubject = _this.insertSubjects.find(function (insertedSubject) { return insertedSubject.entity === relatedEntity; });
                                        // if this relation was just inserted
                                        if (insertSubject) {
                                            // check if we have this relation id already
                                            relationId = referencedColumn.getEntityValue(relatedEntity);
                                            if (!relationId) {
                                                // if we don't have relation id then use special values
                                                if (referencedColumn.isGenerated && insertSubject.generatedMap)
                                                    relationId = referencedColumn.getEntityValue(insertSubject.generatedMap);
                                                // todo: handle other special types too
                                            }
                                        }
                                    }
                                    if (relationId) {
                                        updateOptions[joinColumn.databaseName] = relationId;
                                    }
                                });
                            });
                            // if we found relations which we can update - then update them
                            if (Object.keys(updateOptions).length > 0 /*&& subject.hasEntity*/) {
                                // const relatedEntityIdMap = subject.getPersistedEntityIdMap; // todo: this works incorrectly
                                var columns = subject.metadata.parentEntityMetadata ? subject.metadata.primaryColumns : subject.metadata.primaryColumns;
                                var conditions_1 = {};
                                columns.forEach(function (column) {
                                    var entityValue = column.getEntityValue(subject.entity);
                                    // if entity id is a relation, then extract referenced column from that relation
                                    var columnRelation = subject.metadata.relations.find(function (relation) { return relation.propertyName === column.propertyName; });
                                    if (entityValue && columnRelation) { // not sure if we need handle join column from inverse side
                                        columnRelation.joinColumns.forEach(function (joinColumn) {
                                            var relationIdOfEntityValue = entityValue[joinColumn.referencedColumn.propertyName];
                                            if (!relationIdOfEntityValue) {
                                                var entityValueInsertSubject = _this.insertSubjects.find(function (subject) { return subject.entity === entityValue; });
                                                if (entityValueInsertSubject) {
                                                    if (joinColumn.referencedColumn.isGenerated && entityValueInsertSubject.generatedMap)
                                                        relationIdOfEntityValue = joinColumn.referencedColumn.getEntityValue(entityValueInsertSubject.generatedMap);
                                                }
                                            }
                                            if (relationIdOfEntityValue) {
                                                conditions_1[column.databaseName] = relationIdOfEntityValue;
                                            }
                                        });
                                    }
                                    else {
                                        if (entityValue) {
                                            conditions_1[column.databaseName] = entityValue;
                                        }
                                        else {
                                            if (subject.generatedMap)
                                                conditions_1[column.databaseName] = column.getEntityValue(subject.generatedMap);
                                        }
                                    }
                                });
                                if (!Object.keys(conditions_1).length)
                                    return;
                                var updatePromise = _this.queryRunner.update(subject.metadata.tablePath, updateOptions, conditions_1);
                                updatePromises.push(updatePromise);
                            }
                            // we need to update relation ids if newly inserted objects are used from inverse side in one-to-many inverse relation
                            // we also need to update relation ids if newly inserted objects are used from inverse side in one-to-one inverse relation
                            var oneToManyAndOneToOneNonOwnerRelations = subject.metadata.oneToManyRelations.concat(subject.metadata.oneToOneRelations.filter(function (relation) { return !relation.isOwning; }));
                            // console.log(oneToManyAndOneToOneNonOwnerRelations);
                            subject.metadata.extractRelationValuesFromEntity(subject.entity, oneToManyAndOneToOneNonOwnerRelations)
                                .forEach(function (_a) {
                                var relation = _a[0], subRelatedEntity = _a[1], inverseEntityMetadata = _a[2];
                                relation.inverseRelation.joinColumns.forEach(function (joinColumn) {
                                    var referencedColumn = joinColumn.referencedColumn;
                                    var columns = inverseEntityMetadata.parentEntityMetadata ? inverseEntityMetadata.primaryColumns : inverseEntityMetadata.primaryColumns;
                                    var conditions = {};
                                    columns.forEach(function (column) {
                                        var entityValue = column.getEntityValue(subRelatedEntity);
                                        // if entity id is a relation, then extract referenced column from that relation
                                        var columnRelation = inverseEntityMetadata.relations.find(function (relation) { return relation.propertyName === column.propertyName; });
                                        if (entityValue && columnRelation) { // not sure if we need handle join column from inverse side
                                            columnRelation.joinColumns.forEach(function (columnRelationJoinColumn) {
                                                var relationIdOfEntityValue = entityValue[columnRelationJoinColumn.referencedColumn.propertyName];
                                                if (!relationIdOfEntityValue) {
                                                    var entityValueInsertSubject = _this.insertSubjects.find(function (subject) { return subject.entity === entityValue; });
                                                    if (entityValueInsertSubject) {
                                                        if (columnRelationJoinColumn.referencedColumn.isGenerated && entityValueInsertSubject.generatedMap) {
                                                            relationIdOfEntityValue = columnRelationJoinColumn.referencedColumn.getEntityValue(entityValueInsertSubject.generatedMap);
                                                        }
                                                    }
                                                }
                                                if (relationIdOfEntityValue) {
                                                    conditions[column.databaseName] = relationIdOfEntityValue;
                                                }
                                            });
                                        }
                                        else {
                                            var entityValueInsertSubject = _this.insertSubjects.find(function (subject) { return subject.entity === subRelatedEntity; });
                                            if (entityValue) {
                                                conditions[column.databaseName] = entityValue;
                                            }
                                            else {
                                                if (entityValueInsertSubject && entityValueInsertSubject.generatedMap)
                                                    conditions[column.databaseName] = column.getEntityValue(entityValueInsertSubject.generatedMap);
                                            }
                                        }
                                    });
                                    if (!Object.keys(conditions).length)
                                        return;
                                    var updateOptions = {};
                                    var columnRelation = relation.inverseEntityMetadata.relations.find(function (rel) { return rel.propertyName === referencedColumn.propertyName; });
                                    var columnValue = referencedColumn.getEntityValue(subject.entity);
                                    if (columnRelation) {
                                        var id = columnRelation.getEntityValue(columnValue);
                                        if (!id) {
                                            var insertSubject = _this.insertSubjects.find(function (subject) { return subject.entity === columnValue; });
                                            if (insertSubject) {
                                                if (insertSubject.generatedMap)
                                                    id = referencedColumn.getEntityValue(insertSubject.generatedMap);
                                            }
                                        }
                                        updateOptions[joinColumn.databaseName] = id;
                                    }
                                    else {
                                        var generatedColumnValue = subject.generatedMap ? referencedColumn.getEntityValue(subject.generatedMap) : undefined;
                                        updateOptions[joinColumn.databaseName] = columnValue || generatedColumnValue;
                                    }
                                    var updatePromise = _this.queryRunner.update(relation.inverseEntityMetadata.tablePath, updateOptions, conditions);
                                    updatePromises.push(updatePromise);
                                });
                            });
                        });
                        return [4 /*yield*/, Promise.all(updatePromises)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Inserts an entity from the given insert operation into the database.
     * If entity has an generated column, then after saving new generated value will be stored to the InsertOperation.
     * If entity uses class-table-inheritance, then multiple inserts may by performed to save all entities.
     */
    SubjectOperationExecutor.prototype.insert = function (subject, alreadyInsertedSubjects) {
        return __awaiter(this, void 0, void 0, function () {
            var parentEntityMetadata, metadata, entity, insertResult, parentGeneratedId, parentValuesMap, childValuesMap, secondGeneratedId, valuesMap;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        parentEntityMetadata = subject.metadata.parentEntityMetadata;
                        metadata = subject.metadata;
                        entity = subject.entity;
                        if (!metadata.isClassTableChild) return [3 /*break*/, 3];
                        parentValuesMap = this.collectColumnsAndValues(parentEntityMetadata, entity, subject.date, undefined, metadata.discriminatorValue, alreadyInsertedSubjects, "insert");
                        return [4 /*yield*/, this.queryRunner.insert(parentEntityMetadata.tablePath, parentValuesMap)];
                    case 1:
                        insertResult = parentGeneratedId = _a.sent();
                        childValuesMap = this.collectColumnsAndValues(metadata, entity, subject.date, insertResult.generatedMap[parentEntityMetadata.primaryColumns[0].propertyName], undefined, alreadyInsertedSubjects, "insert");
                        return [4 /*yield*/, this.queryRunner.insert(metadata.tablePath, childValuesMap)];
                    case 2:
                        secondGeneratedId = _a.sent();
                        if (!insertResult && secondGeneratedId)
                            insertResult = secondGeneratedId;
                        return [3 /*break*/, 5];
                    case 3:
                        valuesMap = this.collectColumnsAndValues(metadata, entity, subject.date, undefined, undefined, alreadyInsertedSubjects, "insert");
                        return [4 /*yield*/, this.queryRunner.insert(metadata.tablePath, valuesMap)];
                    case 4:
                        // console.log("valuesMap", valuesMap);
                        insertResult = _a.sent();
                        _a.label = 5;
                    case 5:
                        if (parentGeneratedId)
                            subject.parentGeneratedId = parentGeneratedId.generatedMap[parentEntityMetadata.primaryColumns[0].propertyName];
                        // todo: better if insert method will return object with all generated ids, object id, etc.
                        if (insertResult.generatedMap)
                            subject.generatedMap = insertResult.generatedMap;
                        return [2 /*return*/];
                }
            });
        });
    };
    SubjectOperationExecutor.prototype.collectColumns = function (columns, entity, object, operation) {
        var _this = this;
        columns.forEach(function (column) {
            if (column.isVirtual || column.isParentId || column.isDiscriminator)
                return;
            if (operation === "update" && column.isReadonly)
                return;
            var value = entity[column.propertyName];
            if (value === undefined)
                return;
            object[column.databaseNameWithoutPrefixes] = _this.connection.driver.preparePersistentValue(value, column); // todo: maybe preparePersistentValue is not responsibility of this class
        });
    };
    SubjectOperationExecutor.prototype.collectEmbeds = function (embed, entity, object, operation) {
        var _this = this;
        if (embed.isArray) {
            if (entity[embed.propertyName] instanceof Array) {
                if (!object[embed.prefix])
                    object[embed.prefix] = [];
                entity[embed.propertyName].forEach(function (subEntity, index) {
                    if (!object[embed.prefix][index])
                        object[embed.prefix][index] = {};
                    _this.collectColumns(embed.columns, subEntity, object[embed.prefix][index], operation);
                    embed.embeddeds.forEach(function (childEmbed) { return _this.collectEmbeds(childEmbed, subEntity, object[embed.prefix][index], operation); });
                });
            }
        }
        else {
            if (entity[embed.propertyName] !== undefined) {
                if (!object[embed.prefix])
                    object[embed.prefix] = {};
                this.collectColumns(embed.columns, entity[embed.propertyName], object[embed.prefix], operation);
                embed.embeddeds.forEach(function (childEmbed) { return _this.collectEmbeds(childEmbed, entity[embed.propertyName], object[embed.prefix], operation); });
            }
        }
    };
    /**
     * Collects columns and values for the insert operation.
     */
    SubjectOperationExecutor.prototype.collectColumnsAndValues = function (metadata, entity, date, parentIdColumnValue, discriminatorValue, alreadyInsertedSubjects, operation) {
        var _this = this;
        var values = {};
        if (this.connection.driver instanceof MongoDriver) {
            this.collectColumns(metadata.ownColumns, entity, values, operation);
            metadata.embeddeds.forEach(function (embed) { return _this.collectEmbeds(embed, entity, values, operation); });
        }
        else {
            metadata.columns.forEach(function (column) {
                if (column.isVirtual || column.isParentId || column.isDiscriminator)
                    return;
                var value = column.getEntityValue(entity);
                if (value === undefined)
                    return;
                values[column.databaseName] = _this.connection.driver.preparePersistentValue(value, column); // todo: maybe preparePersistentValue is not responsibility of this class
            });
        }
        metadata.relationsWithJoinColumns.forEach(function (relation) {
            relation.joinColumns.forEach(function (joinColumn) {
                var relationValue;
                var value = relation.getEntityValue(entity);
                if (value) {
                    // if relation value is stored in the entity itself then use it from there
                    var relationId = joinColumn.referencedColumn.getEntityValue(value); // relation.getInverseEntityRelationId(value); // todo: check it
                    if (relationId) {
                        relationValue = relationId;
                    }
                    // otherwise try to find relational value from just inserted subjects
                    var alreadyInsertedSubject = alreadyInsertedSubjects.find(function (insertedSubject) {
                        return insertedSubject.entity === value;
                    });
                    if (alreadyInsertedSubject) {
                        var referencedColumn = joinColumn.referencedColumn;
                        // if join column references to the primary generated column then seek in the newEntityId of the insertedSubject
                        if (referencedColumn.referencedColumn && referencedColumn.referencedColumn.isGenerated) {
                            if (referencedColumn.isParentId) {
                                relationValue = alreadyInsertedSubject.parentGeneratedId;
                            }
                            // todo: what if reference column is not generated?
                            // todo: what if reference column is not related to table inheritance?
                        }
                        if (referencedColumn.isGenerated && alreadyInsertedSubject.generatedMap)
                            relationValue = referencedColumn.getEntityValue(alreadyInsertedSubject.generatedMap);
                        // if it references to create or update date columns
                        if (referencedColumn.isCreateDate || referencedColumn.isUpdateDate)
                            relationValue = _this.connection.driver.preparePersistentValue(alreadyInsertedSubject.date, referencedColumn);
                        // if it references to version column
                        if (referencedColumn.isVersion)
                            relationValue = _this.connection.driver.preparePersistentValue(1, referencedColumn);
                    }
                }
                else if (relation.inverseRelation) {
                    var inverseSubject = _this.allSubjects.find(function (subject) {
                        if (!subject.hasEntity || subject.entityTarget !== relation.inverseRelation.target)
                            return false;
                        var inverseRelationValue = relation.inverseRelation.getEntityValue(subject.entity);
                        if (inverseRelationValue) {
                            if (inverseRelationValue instanceof Array) {
                                return inverseRelationValue.find(function (subValue) { return subValue === subValue; });
                            }
                            else {
                                return inverseRelationValue === entity;
                            }
                        }
                    });
                    if (inverseSubject && joinColumn.referencedColumn.getEntityValue(inverseSubject.entity)) {
                        relationValue = joinColumn.referencedColumn.getEntityValue(inverseSubject.entity);
                    }
                }
                if (relationValue) {
                    values[joinColumn.databaseName] = relationValue;
                }
            });
        });
        // add special column and value - date of creation
        if (metadata.createDateColumn) {
            var value = this.connection.driver.preparePersistentValue(date, metadata.createDateColumn);
            values[metadata.createDateColumn.databaseName] = value;
        }
        // add special column and value - date of updating
        if (metadata.updateDateColumn) {
            var value = this.connection.driver.preparePersistentValue(date, metadata.updateDateColumn);
            values[metadata.updateDateColumn.databaseName] = value;
        }
        // add special column and value - version column
        if (metadata.versionColumn) {
            var value = this.connection.driver.preparePersistentValue(1, metadata.versionColumn);
            values[metadata.versionColumn.databaseName] = value;
        }
        // add special column and value - discriminator value (for tables using table inheritance)
        if (metadata.discriminatorColumn) {
            var value = this.connection.driver.preparePersistentValue(discriminatorValue || metadata.discriminatorValue, metadata.discriminatorColumn);
            values[metadata.discriminatorColumn.databaseName] = value;
        }
        metadata.generatedColumns
            .filter(function (column) { return column.generationStrategy === "uuid"; })
            .forEach(function (column) {
            if (column.isNullable && values[column.databaseName] === null)
                return;
            var uuid = _this.connection.driver.preparePersistentValue("", column);
            if (uuid && !values[column.databaseName])
                values[column.databaseName] = uuid;
        });
        // add special column and value - tree level and tree parents (for tree-type tables)
        if (metadata.treeLevelColumn && metadata.treeParentRelation) {
            var parentEntity = metadata.treeParentRelation.getEntityValue(entity);
            var parentLevel = parentEntity ? (metadata.treeLevelColumn.getEntityValue(parentEntity) || 0) : 0;
            values[metadata.treeLevelColumn.databaseName] = parentLevel + 1;
        }
        // add special column and value - parent id column (for tables using table inheritance)
        if (metadata.parentEntityMetadata && metadata.parentIdColumns.length) { // todo: should be array of primary keys
            values[metadata.parentIdColumns[0].databaseName] = parentIdColumnValue || metadata.parentEntityMetadata.primaryColumns[0].getEntityValue(entity);
        }
        return values;
    };
    // -------------------------------------------------------------------------
    // Private Methods: Insertion into closure tables
    // -------------------------------------------------------------------------
    /**
     * Inserts all given subjects into closure table.
     */
    SubjectOperationExecutor.prototype.executeInsertClosureTableOperations = function ( /*, updatesByRelations: Subject[]*/) {
        var _this = this;
        var promises = this.insertSubjects
            .filter(function (subject) { return subject.metadata.isClosure; })
            .map(function (subject) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // const relationsUpdateMap = this.findUpdateOperationForEntity(updatesByRelations, insertSubjects, subject.entity);
                    // subject.treeLevel = await this.insertIntoClosureTable(subject, relationsUpdateMap);
                    return [4 /*yield*/, this.insertClosureTableValues(subject)];
                    case 1:
                        // const relationsUpdateMap = this.findUpdateOperationForEntity(updatesByRelations, insertSubjects, subject.entity);
                        // subject.treeLevel = await this.insertIntoClosureTable(subject, relationsUpdateMap);
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        return Promise.all(promises);
    };
    /**
     * Inserts given subject into closure table.
     */
    SubjectOperationExecutor.prototype.insertClosureTableValues = function (subject) {
        return __awaiter(this, void 0, void 0, function () {
            var tablePath, referencedColumn, newEntityId, parentEntity, parentEntityId, parentInsertedSubject, parentSubject, _a, values, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        tablePath = subject.metadata.closureJunctionTable.tablePath;
                        referencedColumn = subject.metadata.treeParentRelation.joinColumns[0].referencedColumn;
                        newEntityId = referencedColumn.getEntityValue(subject.entity);
                        if (!newEntityId && referencedColumn.isGenerated && subject.generatedMap) {
                            newEntityId = referencedColumn.getEntityValue(subject.generatedMap);
                            // we should not handle object id here because closure tables are not supported by mongodb driver.
                        } // todo: implement other special column types too
                        parentEntity = subject.metadata.treeParentRelation.getEntityValue(subject.entity);
                        parentEntityId = 0;
                        if (parentEntity) {
                            parentEntityId = referencedColumn.getEntityValue(parentEntity);
                            if (!parentEntityId && referencedColumn.isGenerated) {
                                parentInsertedSubject = this.insertSubjects.find(function (subject) { return subject.entity === parentEntity; });
                                // todo: throw exception if parentInsertedSubject is not set
                                if (parentInsertedSubject.generatedMap)
                                    parentEntityId = referencedColumn.getEntityValue(parentInsertedSubject.generatedMap);
                            } // todo: implement other special column types too
                        }
                        // try to find parent entity id in some other entity that has this entity in its children
                        if (!parentEntityId) {
                            parentSubject = this.allSubjects.find(function (allSubject) {
                                if (!allSubject.hasEntity || !allSubject.metadata.isClosure || !allSubject.metadata.treeChildrenRelation)
                                    return false;
                                var children = subject.metadata.treeChildrenRelation.getEntityValue(allSubject.entity);
                                return children instanceof Array ? children.indexOf(subject.entity) !== -1 : false;
                            });
                            if (parentSubject) {
                                parentEntityId = referencedColumn.getEntityValue(parentSubject.entity);
                                if (!parentEntityId && parentSubject.generatedMap) { // if still not found then it means parent just inserted with generated column
                                    parentEntityId = referencedColumn.getEntityValue(parentSubject.generatedMap);
                                }
                            }
                        }
                        // if parent entity exist then insert a new row into closure table
                        _a = subject;
                        return [4 /*yield*/, this.queryRunner.insertIntoClosureTable(tablePath, newEntityId, parentEntityId, !!subject.metadata.treeLevelColumn)];
                    case 1:
                        // if parent entity exist then insert a new row into closure table
                        _a.treeLevel = _d.sent();
                        if (!subject.metadata.treeLevelColumn) return [3 /*break*/, 3];
                        values = (_b = {}, _b[subject.metadata.treeLevelColumn.databaseName] = subject.treeLevel, _b);
                        return [4 /*yield*/, this.queryRunner.update(subject.metadata.tablePath, values, (_c = {}, _c[referencedColumn.databaseName] = newEntityId, _c))];
                    case 2:
                        _d.sent();
                        _d.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // -------------------------------------------------------------------------
    // Private Methods: Update
    // -------------------------------------------------------------------------
    /**
     * Updates all given subjects in the database.
     */
    SubjectOperationExecutor.prototype.executeUpdateOperations = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.all(this.updateSubjects.map(function (subject) { return _this.update(subject); }))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Updates given subject in the database.
     */
    SubjectOperationExecutor.prototype.update = function (subject) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var entity, idMap, value_1, valueMaps, valueMap, valueMap, valueMap, valueMap;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        entity = subject.entity;
                        if (this.connection.driver instanceof MongoDriver) {
                            idMap = subject.metadata.getDatabaseEntityIdMap(entity);
                            if (!idMap)
                                throw new Error("Internal error. Cannot get id of the updating entity.");
                            value_1 = {};
                            this.collectColumns(subject.metadata.ownColumns, entity, value_1, "update");
                            subject.metadata.embeddeds.forEach(function (embed) { return _this.collectEmbeds(embed, entity, value_1, "update"); });
                            // if number of updated columns = 0 no need to update updated date and version columns
                            if (Object.keys(value_1).length === 0)
                                return [2 /*return*/];
                            if (subject.metadata.updateDateColumn)
                                value_1[subject.metadata.updateDateColumn.databaseName] = this.connection.driver.preparePersistentValue(new Date(), subject.metadata.updateDateColumn);
                            if (subject.metadata.versionColumn)
                                value_1[subject.metadata.versionColumn.databaseName] = this.connection.driver.preparePersistentValue(subject.metadata.versionColumn.getEntityValue(entity) + 1, subject.metadata.versionColumn);
                            return [2 /*return*/, this.queryRunner.update(subject.metadata.tablePath, value_1, idMap)];
                        }
                        valueMaps = [];
                        // console.log(subject.diffColumns);
                        subject.diffColumns.forEach(function (column) {
                            // if (!column.entityTarget) return; // todo: how this can be possible?
                            var metadata = _this.connection.getMetadata(column.entityMetadata.target);
                            var valueMap = valueMaps.find(function (valueMap) { return valueMap.tablePath === metadata.tablePath; });
                            if (!valueMap) {
                                valueMap = { tablePath: metadata.tablePath, metadata: metadata, values: {} };
                                valueMaps.push(valueMap);
                            }
                            valueMap.values[column.databaseName] = _this.connection.driver.preparePersistentValue(column.getEntityValue(entity), column);
                        });
                        subject.diffRelations.forEach(function (relation) {
                            var valueMap = valueMaps.find(function (valueMap) { return valueMap.tablePath === relation.entityMetadata.tablePath; });
                            if (!valueMap) {
                                valueMap = { tablePath: relation.entityMetadata.tablePath, metadata: relation.entityMetadata, values: {} };
                                valueMaps.push(valueMap);
                            }
                            var value = relation.getEntityValue(entity);
                            relation.joinColumns.forEach(function (joinColumn) {
                                valueMap.values[joinColumn.databaseName] = value !== null && value !== undefined ? value[joinColumn.referencedColumn.propertyName] : null; // todo: should not have a call to primaryColumn, instead join column metadata should be used
                            });
                        });
                        // if number of updated columns = 0 no need to update updated date and version columns
                        if (Object.keys(valueMaps).length === 0)
                            return [2 /*return*/];
                        if (subject.metadata.updateDateColumn) {
                            valueMap = valueMaps.find(function (valueMap) { return valueMap.tablePath === subject.metadata.tablePath; });
                            if (!valueMap) {
                                valueMap = { tablePath: subject.metadata.tablePath, metadata: subject.metadata, values: {} };
                                valueMaps.push(valueMap);
                            }
                            valueMap.values[subject.metadata.updateDateColumn.databaseName] = this.connection.driver.preparePersistentValue(new Date(), subject.metadata.updateDateColumn);
                        }
                        if (subject.metadata.versionColumn) {
                            valueMap = valueMaps.find(function (valueMap) { return valueMap.tablePath === subject.metadata.tablePath; });
                            if (!valueMap) {
                                valueMap = { tablePath: subject.metadata.tablePath, metadata: subject.metadata, values: {} };
                                valueMaps.push(valueMap);
                            }
                            valueMap.values[subject.metadata.versionColumn.databaseName] = this.connection.driver.preparePersistentValue(subject.metadata.versionColumn.getEntityValue(entity) + 1, subject.metadata.versionColumn);
                        }
                        if (subject.metadata.parentEntityMetadata) {
                            if (subject.metadata.parentEntityMetadata.updateDateColumn) {
                                valueMap = valueMaps.find(function (valueMap) { return valueMap.tablePath === subject.metadata.parentEntityMetadata.tablePath; });
                                if (!valueMap) {
                                    valueMap = {
                                        tablePath: subject.metadata.parentEntityMetadata.tablePath,
                                        metadata: subject.metadata.parentEntityMetadata,
                                        values: {}
                                    };
                                    valueMaps.push(valueMap);
                                }
                                valueMap.values[subject.metadata.parentEntityMetadata.updateDateColumn.databaseName] = this.connection.driver.preparePersistentValue(new Date(), subject.metadata.parentEntityMetadata.updateDateColumn);
                            }
                            if (subject.metadata.parentEntityMetadata.versionColumn) {
                                valueMap = valueMaps.find(function (valueMap) { return valueMap.tablePath === subject.metadata.parentEntityMetadata.tablePath; });
                                if (!valueMap) {
                                    valueMap = {
                                        tablePath: subject.metadata.parentEntityMetadata.tablePath,
                                        metadata: subject.metadata.parentEntityMetadata,
                                        values: {}
                                    };
                                    valueMaps.push(valueMap);
                                }
                                valueMap.values[subject.metadata.parentEntityMetadata.versionColumn.databaseName] = this.connection.driver.preparePersistentValue(subject.metadata.parentEntityMetadata.versionColumn.getEntityValue(entity) + 1, subject.metadata.parentEntityMetadata.versionColumn);
                            }
                        }
                        return [4 /*yield*/, Promise.all(valueMaps.map(function (valueMap) {
                                var idMap = valueMap.metadata.getDatabaseEntityIdMap(entity);
                                if (!idMap)
                                    throw new Error("Internal error. Cannot get id of the updating entity.");
                                return _this.queryRunner.update(valueMap.tablePath, valueMap.values, idMap);
                            }))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // -------------------------------------------------------------------------
    // Private Methods: Update only relations
    // -------------------------------------------------------------------------
    /**
     * Updates relations of all given subjects in the database.
     */
    SubjectOperationExecutor.prototype.executeUpdateRelations = function () {
        var _this = this;
        return Promise.all(this.relationUpdateSubjects.map(function (subject) { return _this.updateRelations(subject); }));
    };
    /**
     * Updates relations of the given subject in the database.
     */
    SubjectOperationExecutor.prototype.updateRelations = function (subject) {
        return __awaiter(this, void 0, void 0, function () {
            var values, idMap;
            return __generator(this, function (_a) {
                values = {};
                subject.relationUpdates.forEach(function (setRelation) {
                    setRelation.relation.joinColumns.forEach(function (joinColumn) {
                        var value = setRelation.value ? setRelation.value[joinColumn.referencedColumn.propertyName] : null;
                        values[joinColumn.databaseName] = value; // todo: || fromInsertedSubjects ??
                    });
                });
                idMap = subject.metadata.getDatabaseEntityIdMap(subject.databaseEntity);
                if (!idMap)
                    throw new Error("Internal error. Cannot get id of the updating entity.");
                return [2 /*return*/, this.queryRunner.update(subject.metadata.tablePath, values, idMap)];
            });
        });
    };
    // -------------------------------------------------------------------------
    // Private Methods: Remove
    // -------------------------------------------------------------------------
    /**
     * Removes all given subjects from the database.
     */
    SubjectOperationExecutor.prototype.executeRemoveOperations = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, PromiseUtils.runInSequence(this.removeSubjects, function (subject) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, this.remove(subject)];
                                case 1: return [2 /*return*/, _a.sent()];
                            }
                        }); }); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Updates given subject from the database.
     */
    SubjectOperationExecutor.prototype.remove = function (subject) {
        return __awaiter(this, void 0, void 0, function () {
            var parentConditions_1, childConditions_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!subject.metadata.parentEntityMetadata) return [3 /*break*/, 3];
                        parentConditions_1 = {};
                        subject.metadata.primaryColumns.forEach(function (column) {
                            parentConditions_1[column.databaseName] = column.getEntityValue(subject.databaseEntity);
                        });
                        return [4 /*yield*/, this.queryRunner.delete(subject.metadata.parentEntityMetadata.tablePath, parentConditions_1)];
                    case 1:
                        _a.sent();
                        childConditions_1 = {};
                        subject.metadata.primaryColumns.forEach(function (column) {
                            childConditions_1[column.databaseName] = column.getEntityValue(subject.databaseEntity);
                        });
                        return [4 /*yield*/, this.queryRunner.delete(subject.metadata.tablePath, childConditions_1)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, this.queryRunner.delete(subject.metadata.tablePath, subject.metadata.getDatabaseEntityIdMap(subject.databaseEntity))];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    // -------------------------------------------------------------------------
    // Private Methods: Insertion into junction tables
    // -------------------------------------------------------------------------
    /**
     * Inserts into database junction tables all given array of subjects junction data.
     */
    SubjectOperationExecutor.prototype.executeInsertJunctionsOperations = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var promises;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        promises = [];
                        this.allSubjects.forEach(function (subject) {
                            subject.junctionInserts.forEach(function (junctionInsert) {
                                promises.push(_this.insertJunctions(subject, junctionInsert));
                            });
                        });
                        return [4 /*yield*/, Promise.all(promises)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Inserts into database junction table given subject's junction insert data.
     */
    SubjectOperationExecutor.prototype.insertJunctions = function (subject, junctionInsert) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var getRelationId, relation, joinColumns, ownId, promises;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        getRelationId = function (entity, joinColumns) {
                            return joinColumns.map(function (joinColumn) {
                                var id = joinColumn.referencedColumn.getEntityValue(entity);
                                if (!id && joinColumn.referencedColumn.isGenerated) {
                                    var insertSubject = _this.insertSubjects.find(function (subject) { return subject.entity === entity; });
                                    if (insertSubject && insertSubject.generatedMap)
                                        return joinColumn.referencedColumn.getEntityValue(insertSubject.generatedMap);
                                }
                                // todo: implement other special referenced column types (update date, create date, version, discriminator column, etc.)
                                return id;
                            });
                        };
                        relation = junctionInsert.relation;
                        joinColumns = relation.isManyToManyOwner ? relation.joinColumns : relation.inverseRelation.inverseJoinColumns;
                        ownId = getRelationId(subject.entity, joinColumns);
                        if (!ownId.length)
                            throw new Error("Cannot insert object of " + subject.entityTarget + " type. Looks like its not persisted yet, or cascades are not set on the relation."); // todo: better error message
                        promises = junctionInsert.junctionEntities.map(function (newBindEntity) {
                            // get relation id from the newly bind entity
                            var joinColumns = relation.isManyToManyOwner ? relation.inverseJoinColumns : relation.inverseRelation.joinColumns;
                            var relationId = getRelationId(newBindEntity, joinColumns);
                            // if relation id still does not exist - we arise an error
                            if (!relationId)
                                throw new Error("Cannot insert object of " + newBindEntity.constructor.name + " type. Looks like its not persisted yet, or cascades are not set on the relation."); // todo: better error message
                            var columns = relation.junctionEntityMetadata.columns.map(function (column) { return column.databaseName; });
                            var values = relation.isOwning ? ownId.concat(relationId) : relationId.concat(ownId);
                            return _this.queryRunner.insert(relation.junctionEntityMetadata.tablePath, OrmUtils.zipObject(columns, values));
                        });
                        return [4 /*yield*/, Promise.all(promises)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // -------------------------------------------------------------------------
    // Private Methods: Remove from junction tables
    // -------------------------------------------------------------------------
    /**
     * Removes from database junction tables all given array of subjects removal junction data.
     */
    SubjectOperationExecutor.prototype.executeRemoveJunctionsOperations = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var promises;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        promises = [];
                        this.allSubjects.forEach(function (subject) {
                            subject.junctionRemoves.forEach(function (junctionRemove) {
                                promises.push(_this.removeJunctions(subject, junctionRemove));
                            });
                        });
                        return [4 /*yield*/, Promise.all(promises)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Removes from database junction table all given subject's removal junction data.
     */
    SubjectOperationExecutor.prototype.removeJunctions = function (subject, junctionRemove) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var junctionMetadata, entity, firstJoinColumns, secondJoinColumns, conditions, removePromises;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        junctionMetadata = junctionRemove.relation.junctionEntityMetadata;
                        entity = subject.hasEntity ? subject.entity : subject.databaseEntity;
                        firstJoinColumns = junctionRemove.relation.isOwning ? junctionRemove.relation.joinColumns : junctionRemove.relation.inverseRelation.inverseJoinColumns;
                        secondJoinColumns = junctionRemove.relation.isOwning ? junctionRemove.relation.inverseJoinColumns : junctionRemove.relation.inverseRelation.joinColumns;
                        conditions = {};
                        firstJoinColumns.forEach(function (joinColumn) {
                            conditions[joinColumn.databaseName] = joinColumn.referencedColumn.getEntityValue(entity);
                        });
                        removePromises = junctionRemove.junctionRelationIds.map(function (relationIds) {
                            var inverseConditions = {};
                            secondJoinColumns.forEach(function (joinColumn) {
                                inverseConditions[joinColumn.databaseName] = joinColumn.referencedColumn.getEntityValue(relationIds);
                            });
                            return _this.queryRunner.delete(junctionMetadata.tableName, Object.assign({}, inverseConditions, conditions));
                        });
                        return [4 /*yield*/, Promise.all(removePromises)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // -------------------------------------------------------------------------
    // Private Methods: Refresh entity values after persistence
    // -------------------------------------------------------------------------
    /**
     * Updates all special columns of the saving entities (create date, update date, versioning).
     */
    SubjectOperationExecutor.prototype.updateSpecialColumnsInPersistedEntities = function () {
        // update entity columns that gets updated on each entity insert
        this.insertSubjects.forEach(function (subject) {
            // if (subject.generatedObjectId && subject.metadata.objectIdColumn)
            //     subject.metadata.objectIdColumn.setEntityValue(subject.entity, subject.generatedObjectId);
            if (subject.generatedMap) {
                subject.metadata.generatedColumns.forEach(function (generatedColumn) {
                    var generatedValue = generatedColumn.getEntityValue(subject.generatedMap);
                    if (!generatedValue)
                        return;
                    generatedColumn.setEntityValue(subject.entity, generatedValue);
                });
            }
            subject.metadata.primaryColumns.forEach(function (primaryColumn) {
                if (subject.parentGeneratedId)
                    primaryColumn.setEntityValue(subject.entity, subject.parentGeneratedId);
            });
            if (subject.metadata.updateDateColumn)
                subject.metadata.updateDateColumn.setEntityValue(subject.entity, subject.date);
            if (subject.metadata.createDateColumn)
                subject.metadata.createDateColumn.setEntityValue(subject.entity, subject.date);
            if (subject.metadata.versionColumn)
                subject.metadata.versionColumn.setEntityValue(subject.entity, 1);
            if (subject.metadata.treeLevelColumn) {
                // const parentEntity = insertOperation.entity[metadata.treeParentMetadata.propertyName];
                // const parentLevel = parentEntity ? (parentEntity[metadata.treeLevelColumn.propertyName] || 0) : 0;
                subject.metadata.treeLevelColumn.setEntityValue(subject.entity, subject.treeLevel);
            }
            /*if (subject.metadata.hasTreeChildrenCountColumn) {
                 subject.entity[subject.metadata.treeChildrenCountColumn.propertyName] = 0;
            }*/
            // set values to "null" for nullable columns that did not have values
            subject.metadata.columns
                .filter(function (column) { return column.isNullable && !column.isVirtual; })
                .forEach(function (column) {
                var columnValue = column.getEntityValue(subject.entity);
                if (columnValue === undefined)
                    column.setEntityValue(subject.entity, null);
            });
        });
        // update special columns that gets updated on each entity update
        this.updateSubjects.forEach(function (subject) {
            if (subject.metadata.updateDateColumn)
                subject.metadata.updateDateColumn.setEntityValue(subject.entity, subject.date);
            if (subject.metadata.versionColumn)
                subject.metadata.versionColumn.setEntityValue(subject.entity, subject.metadata.versionColumn.getEntityValue(subject.entity) + 1);
        });
        // remove ids from the entities that were removed
        this.removeSubjects
            .filter(function (subject) { return subject.hasEntity; })
            .forEach(function (subject) {
            subject.metadata.primaryColumns.forEach(function (primaryColumn) {
                primaryColumn.setEntityValue(subject.entity, undefined);
            });
        });
        this.allSubjects
            .filter(function (subject) { return subject.hasEntity; })
            .forEach(function (subject) {
            subject.metadata.relationIds.forEach(function (relationId) {
                relationId.setValue(subject.entity);
            });
        });
    };
    return SubjectOperationExecutor;
}());
export { SubjectOperationExecutor };

//# sourceMappingURL=SubjectOperationExecutor.js.map
