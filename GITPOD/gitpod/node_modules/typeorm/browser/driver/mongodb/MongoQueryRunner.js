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
 * Runs queries on a single MongoDB connection.
 */
var MongoQueryRunner = /** @class */ (function () {
    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    function MongoQueryRunner(connection, databaseConnection) {
        /**
         * Indicates if connection for this query runner is released.
         * Once its released, query runner cannot run queries anymore.
         * Always false for mongodb since mongodb has a single query executor instance.
         */
        this.isReleased = false;
        /**
         * Indicates if transaction is active in this query executor.
         * Always false for mongodb since mongodb does not support transactions.
         */
        this.isTransactionActive = false;
        /**
         * Stores temporarily user data.
         * Useful for sharing data with subscribers.
         */
        this.data = {};
        this.connection = connection;
        this.databaseConnection = databaseConnection;
    }
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    /**
     * Creates a cursor for a query that can be used to iterate over results from MongoDB.
     */
    MongoQueryRunner.prototype.cursor = function (collectionName, query) {
        return this.getCollection(collectionName).find(query || {});
    };
    /**
     * Execute an aggregation framework pipeline against the collection.
     */
    MongoQueryRunner.prototype.aggregate = function (collectionName, pipeline, options) {
        return this.getCollection(collectionName).aggregate(pipeline, options);
    };
    /**
     * Perform a bulkWrite operation without a fluent API.
     */
    MongoQueryRunner.prototype.bulkWrite = function (collectionName, operations, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getCollection(collectionName).bulkWrite(operations, options)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Count number of matching documents in the db to a query.
     */
    MongoQueryRunner.prototype.count = function (collectionName, query, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getCollection(collectionName).count(query || {}, options)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Creates an index on the db and collection.
     */
    MongoQueryRunner.prototype.createCollectionIndex = function (collectionName, fieldOrSpec, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getCollection(collectionName).createIndex(fieldOrSpec, options)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Creates multiple indexes in the collection, this method is only supported for MongoDB 2.6 or higher.
     * Earlier version of MongoDB will throw a command not supported error. Index specifications are defined at http://docs.mongodb.org/manual/reference/command/createIndexes/.
     */
    MongoQueryRunner.prototype.createCollectionIndexes = function (collectionName, indexSpecs) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getCollection(collectionName).createIndexes(indexSpecs)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Delete multiple documents on MongoDB.
     */
    MongoQueryRunner.prototype.deleteMany = function (collectionName, query, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getCollection(collectionName).deleteMany(query, options)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Delete a document on MongoDB.
     */
    MongoQueryRunner.prototype.deleteOne = function (collectionName, query, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getCollection(collectionName).deleteOne(query, options)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * The distinct command returns returns a list of distinct values for the given key across a collection.
     */
    MongoQueryRunner.prototype.distinct = function (collectionName, key, query, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getCollection(collectionName).distinct(key, query, options)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Drops an index from this collection.
     */
    MongoQueryRunner.prototype.dropCollectionIndex = function (collectionName, indexName, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getCollection(collectionName).dropIndex(indexName, options)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Drops all indexes from the collection.
     */
    MongoQueryRunner.prototype.dropCollectionIndexes = function (collectionName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getCollection(collectionName).dropIndexes()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Find a document and delete it in one atomic operation, requires a write lock for the duration of the operation.
     */
    MongoQueryRunner.prototype.findOneAndDelete = function (collectionName, query, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getCollection(collectionName).findOneAndDelete(query, options)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Find a document and replace it in one atomic operation, requires a write lock for the duration of the operation.
     */
    MongoQueryRunner.prototype.findOneAndReplace = function (collectionName, query, replacement, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getCollection(collectionName).findOneAndReplace(query, replacement, options)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Find a document and update it in one atomic operation, requires a write lock for the duration of the operation.
     */
    MongoQueryRunner.prototype.findOneAndUpdate = function (collectionName, query, update, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getCollection(collectionName).findOneAndUpdate(query, update, options)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Execute a geo search using a geo haystack index on a collection.
     */
    MongoQueryRunner.prototype.geoHaystackSearch = function (collectionName, x, y, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getCollection(collectionName).geoHaystackSearch(x, y, options)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Execute the geoNear command to search for items in the collection.
     */
    MongoQueryRunner.prototype.geoNear = function (collectionName, x, y, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getCollection(collectionName).geoNear(x, y, options)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Run a group command across a collection.
     */
    MongoQueryRunner.prototype.group = function (collectionName, keys, condition, initial, reduce, finalize, command, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getCollection(collectionName).group(keys, condition, initial, reduce, finalize, command, options)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Retrieve all the indexes on the collection.
     */
    MongoQueryRunner.prototype.collectionIndexes = function (collectionName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getCollection(collectionName).indexes()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Retrieve all the indexes on the collection.
     */
    MongoQueryRunner.prototype.collectionIndexExists = function (collectionName, indexes) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getCollection(collectionName).indexExists(indexes)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Retrieves this collections index info.
     */
    MongoQueryRunner.prototype.collectionIndexInformation = function (collectionName, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getCollection(collectionName).indexInformation(options)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Initiate an In order bulk write operation, operations will be serially executed in the order they are added, creating a new operation for each switch in types.
     */
    MongoQueryRunner.prototype.initializeOrderedBulkOp = function (collectionName, options) {
        return this.getCollection(collectionName).initializeOrderedBulkOp(options);
    };
    /**
     * Initiate a Out of order batch write operation. All operations will be buffered into insert/update/remove commands executed out of order.
     */
    MongoQueryRunner.prototype.initializeUnorderedBulkOp = function (collectionName, options) {
        return this.getCollection(collectionName).initializeUnorderedBulkOp(options);
    };
    /**
     * Inserts an array of documents into MongoDB.
     */
    MongoQueryRunner.prototype.insertMany = function (collectionName, docs, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getCollection(collectionName).insertMany(docs, options)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Inserts a single document into MongoDB.
     */
    MongoQueryRunner.prototype.insertOne = function (collectionName, doc, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getCollection(collectionName).insertOne(doc, options)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Returns if the collection is a capped collection.
     */
    MongoQueryRunner.prototype.isCapped = function (collectionName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getCollection(collectionName).isCapped()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Get the list of all indexes information for the collection.
     */
    MongoQueryRunner.prototype.listCollectionIndexes = function (collectionName, options) {
        return this.getCollection(collectionName).listIndexes(options);
    };
    /**
     * Run Map Reduce across a collection. Be aware that the inline option for out will return an array of results not a collection.
     */
    MongoQueryRunner.prototype.mapReduce = function (collectionName, map, reduce, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getCollection(collectionName).mapReduce(map, reduce, options)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Return N number of parallel cursors for a collection allowing parallel reading of entire collection.
     * There are no ordering guarantees for returned results.
     */
    MongoQueryRunner.prototype.parallelCollectionScan = function (collectionName, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getCollection(collectionName).parallelCollectionScan(options)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Reindex all indexes on the collection Warning: reIndex is a blocking operation (indexes are rebuilt in the foreground) and will be slow for large collections.
     */
    MongoQueryRunner.prototype.reIndex = function (collectionName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getCollection(collectionName).reIndex()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Reindex all indexes on the collection Warning: reIndex is a blocking operation (indexes are rebuilt in the foreground) and will be slow for large collections.
     */
    MongoQueryRunner.prototype.rename = function (collectionName, newName, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getCollection(collectionName).rename(newName, options)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Replace a document on MongoDB.
     */
    MongoQueryRunner.prototype.replaceOne = function (collectionName, query, doc, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getCollection(collectionName).replaceOne(query, doc, options)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Get all the collection statistics.
     */
    MongoQueryRunner.prototype.stats = function (collectionName, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getCollection(collectionName).stats(options)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Update multiple documents on MongoDB.
     */
    MongoQueryRunner.prototype.updateMany = function (collectionName, query, update, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getCollection(collectionName).updateMany(query, update, options)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Update a single document on MongoDB.
     */
    MongoQueryRunner.prototype.updateOne = function (collectionName, query, update, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getCollection(collectionName).updateOne(query, update, options)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    // -------------------------------------------------------------------------
    // Public Implemented Methods (from QueryRunner)
    // -------------------------------------------------------------------------
    /**
     * Removes all collections from the currently connected database.
     * Be careful with using this method and avoid using it in production or migrations
     * (because it can clear all your database).
     */
    MongoQueryRunner.prototype.clearDatabase = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.databaseConnection.dropDatabase()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * For MongoDB database we don't create connection, because its single connection already created by a driver.
     */
    MongoQueryRunner.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    /**
     * For MongoDB database we don't release connection, because its single connection.
     */
    MongoQueryRunner.prototype.release = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    /**
     * Starts transaction.
     */
    MongoQueryRunner.prototype.startTransaction = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    /**
     * Commits transaction.
     */
    MongoQueryRunner.prototype.commitTransaction = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    /**
     * Rollbacks transaction.
     */
    MongoQueryRunner.prototype.rollbackTransaction = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    /**
     * Executes a given SQL query.
     */
    MongoQueryRunner.prototype.query = function (query, parameters) {
        throw new Error("Executing SQL query is not supported by MongoDB driver.");
    };
    /**
     * Returns raw data stream.
     */
    MongoQueryRunner.prototype.stream = function (query, parameters, onEnd, onError) {
        throw new Error("Stream is not supported by MongoDB driver.");
    };
    /**
     * Insert a new row with given values into the given table.
     * Returns value of inserted object id.
     */
    MongoQueryRunner.prototype.insert = function (collectionName, keyValues) {
        return __awaiter(this, void 0, void 0, function () {
            var results, generatedMap;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.databaseConnection
                            .collection(collectionName)
                            .insertOne(keyValues)];
                    case 1:
                        results = _a.sent();
                        generatedMap = this.connection.getMetadata(collectionName).objectIdColumn.createValueMap(results.insertedId);
                        return [2 /*return*/, {
                                result: results,
                                generatedMap: generatedMap
                            }];
                }
            });
        });
    };
    /**
     * Updates rows that match given conditions in the given table.
     */
    MongoQueryRunner.prototype.update = function (collectionName, valuesMap, conditions) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.databaseConnection
                            .collection(collectionName)
                            .updateOne(conditions, valuesMap)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Deletes from the given table by a given conditions.
     */
    MongoQueryRunner.prototype.delete = function (collectionName, conditions, maybeParameters) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (typeof conditions === "string")
                            throw new Error("String condition is not supported by MongoDB driver.");
                        return [4 /*yield*/, this.databaseConnection
                                .collection(collectionName)
                                .deleteOne(conditions)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Inserts rows into the closure table.
     */
    MongoQueryRunner.prototype.insertIntoClosureTable = function (collectionName, newEntityId, parentId, hasLevel) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error("Schema update queries are not supported by MongoDB driver.");
            });
        });
    };
    /**
     * Loads given table's data from the database.
     */
    MongoQueryRunner.prototype.getTable = function (collectionName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error("Schema update queries are not supported by MongoDB driver.");
            });
        });
    };
    /**
     * Loads all tables (with given names) from the database and creates a Table from them.
     */
    MongoQueryRunner.prototype.getTables = function (collectionNames) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error("Schema update queries are not supported by MongoDB driver.");
            });
        });
    };
    /**
     * Checks if database with the given name exist.
     */
    MongoQueryRunner.prototype.hasDatabase = function (database) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error("Check database queries are not supported by MongoDB driver.");
            });
        });
    };
    /**
     * Checks if table with the given name exist in the database.
     */
    MongoQueryRunner.prototype.hasTable = function (collectionName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error("Check schema queries are not supported by MongoDB driver.");
            });
        });
    };
    /**
     * Creates a database if it's not created.
     */
    MongoQueryRunner.prototype.createDatabase = function (database) {
        throw new Error("Database create queries are not supported by MongoDB driver.");
    };
    /**
     * Creates a schema if it's not created.
     */
    MongoQueryRunner.prototype.createSchema = function (schemas) {
        throw new Error("Schema create queries are not supported by MongoDB driver.");
    };
    /**
     * Creates a new table from the given table and columns inside it.
     */
    MongoQueryRunner.prototype.createTable = function (table) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error("Schema update queries are not supported by MongoDB driver.");
            });
        });
    };
    /**
     * Drops the table.
     */
    MongoQueryRunner.prototype.dropTable = function (tableName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error("Schema update queries are not supported by MongoDB driver.");
            });
        });
    };
    /**
     * Checks if column with the given name exist in the given table.
     */
    MongoQueryRunner.prototype.hasColumn = function (collectionName, columnName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error("Schema update queries are not supported by MongoDB driver.");
            });
        });
    };
    /**
     * Creates a new column from the column in the table.
     */
    MongoQueryRunner.prototype.addColumn = function (tableOrName, column) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error("Schema update queries are not supported by MongoDB driver.");
            });
        });
    };
    /**
     * Creates a new columns from the column in the table.
     */
    MongoQueryRunner.prototype.addColumns = function (tableOrName, columns) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error("Schema update queries are not supported by MongoDB driver.");
            });
        });
    };
    /**
     * Renames column in the given table.
     */
    MongoQueryRunner.prototype.renameColumn = function (tableOrName, oldTableColumnOrName, newTableColumnOrName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error("Schema update queries are not supported by MongoDB driver.");
            });
        });
    };
    /**
     * Changes a column in the table.
     */
    MongoQueryRunner.prototype.changeColumn = function (tableOrName, oldTableColumnOrName, newColumn) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error("Schema update queries are not supported by MongoDB driver.");
            });
        });
    };
    /**
     * Changes a column in the table.
     */
    MongoQueryRunner.prototype.changeColumns = function (table, changedColumns) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error("Schema update queries are not supported by MongoDB driver.");
            });
        });
    };
    /**
     * Drops column in the table.
     */
    MongoQueryRunner.prototype.dropColumn = function (table, column) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error("Schema update queries are not supported by MongoDB driver.");
            });
        });
    };
    /**
     * Drops the columns in the table.
     */
    MongoQueryRunner.prototype.dropColumns = function (table, columns) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error("Schema update queries are not supported by MongoDB driver.");
            });
        });
    };
    /**
     * Updates table's primary keys.
     */
    MongoQueryRunner.prototype.updatePrimaryKeys = function (table) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error("Schema update queries are not supported by MongoDB driver.");
            });
        });
    };
    /**
     * Creates a new foreign key.
     */
    MongoQueryRunner.prototype.createForeignKey = function (tableOrName, foreignKey) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error("Schema update queries are not supported by MongoDB driver.");
            });
        });
    };
    /**
     * Creates a new foreign keys.
     */
    MongoQueryRunner.prototype.createForeignKeys = function (tableOrName, foreignKeys) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error("Schema update queries are not supported by MongoDB driver.");
            });
        });
    };
    /**
     * Drops a foreign key from the table.
     */
    MongoQueryRunner.prototype.dropForeignKey = function (tableOrName, foreignKey) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error("Schema update queries are not supported by MongoDB driver.");
            });
        });
    };
    /**
     * Drops a foreign keys from the table.
     */
    MongoQueryRunner.prototype.dropForeignKeys = function (tableOrName, foreignKeys) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error("Schema update queries are not supported by MongoDB driver.");
            });
        });
    };
    /**
     * Creates a new index.
     */
    MongoQueryRunner.prototype.createIndex = function (collectionName, index) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error("Schema update queries are not supported by MongoDB driver.");
            });
        });
    };
    /**
     * Drops an index from the table.
     */
    MongoQueryRunner.prototype.dropIndex = function (collectionName, indexName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error("Schema update queries are not supported by MongoDB driver.");
            });
        });
    };
    /**
     * Drops collection.
     */
    MongoQueryRunner.prototype.truncate = function (collectionName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.databaseConnection
                            .dropCollection(collectionName)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Enables special query runner mode in which sql queries won't be executed,
     * instead they will be memorized into a special variable inside query runner.
     * You can get memorized sql using getMemorySql() method.
     */
    MongoQueryRunner.prototype.enableSqlMemory = function () {
        throw new Error("This operation is not supported by MongoDB driver.");
    };
    /**
     * Disables special query runner mode in which sql queries won't be executed
     * started by calling enableSqlMemory() method.
     *
     * Previously memorized sql will be flushed.
     */
    MongoQueryRunner.prototype.disableSqlMemory = function () {
        throw new Error("This operation is not supported by MongoDB driver.");
    };
    /**
     * Gets sql stored in the memory. Parameters in the sql are already replaced.
     */
    MongoQueryRunner.prototype.getMemorySql = function () {
        throw new Error("This operation is not supported by MongoDB driver.");
    };
    // -------------------------------------------------------------------------
    // Protected Methods
    // -------------------------------------------------------------------------
    /**
     * Gets collection from the database with a given name.
     */
    MongoQueryRunner.prototype.getCollection = function (collectionName) {
        return this.databaseConnection.collection(collectionName);
    };
    return MongoQueryRunner;
}());
export { MongoQueryRunner };

//# sourceMappingURL=MongoQueryRunner.js.map
