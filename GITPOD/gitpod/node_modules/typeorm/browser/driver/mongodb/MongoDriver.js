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
import { ConnectionIsNotSetError } from "../../error/ConnectionIsNotSetError";
import { DriverPackageNotInstalledError } from "../../error/DriverPackageNotInstalledError";
import { MongoQueryRunner } from "./MongoQueryRunner";
import { PlatformTools } from "../../platform/PlatformTools";
import { MongoSchemaBuilder } from "../../schema-builder/MongoSchemaBuilder";
/**
 * Organizes communication with MongoDB.
 */
var MongoDriver = /** @class */ (function () {
    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    function MongoDriver(connection) {
        this.connection = connection;
        /**
         * Indicates if replication is enabled.
         */
        this.isReplicated = false;
        /**
         * Indicates if tree tables are supported by this driver.
         */
        this.treeSupport = false;
        /**
         * Mongodb does not need to have column types because they are not used in schema sync.
         */
        this.supportedDataTypes = [];
        /**
         * Gets list of column data types that support length by a driver.
         */
        this.withLengthColumnTypes = [];
        /**
         * Mongodb does not need to have a strong defined mapped column types because they are not used in schema sync.
         */
        this.mappedDataTypes = {
            createDate: "int",
            createDateDefault: "",
            updateDate: "int",
            updateDateDefault: "",
            version: "int",
            treeLevel: "int",
            migrationName: "int",
            migrationTimestamp: "int",
            cacheId: "int",
            cacheIdentifier: "int",
            cacheTime: "int",
            cacheDuration: "int",
            cacheQuery: "int",
            cacheResult: "int",
        };
        this.options = connection.options;
        // validate options to make sure everything is correct and driver will be able to establish connection
        this.validateOptions(connection.options);
        // load mongodb package
        this.loadDependencies();
    }
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    /**
     * Performs connection to the database.
     */
    MongoDriver.prototype.connect = function () {
        var _this = this;
        return new Promise(function (ok, fail) {
            _this.mongodb.MongoClient.connect(_this.buildConnectionUrl(), {
                poolSize: _this.options.poolSize,
                ssl: _this.options.ssl,
                sslValidate: _this.options.sslValidate,
                sslCA: _this.options.sslCA,
                sslCert: _this.options.sslCert,
                sslKey: _this.options.sslKey,
                sslPass: _this.options.sslPass,
                autoReconnect: _this.options.autoReconnect,
                noDelay: _this.options.noDelay,
                keepAlive: _this.options.keepAlive,
                connectTimeoutMS: _this.options.connectTimeoutMS,
                socketTimeoutMS: _this.options.socketTimeoutMS,
                reconnectTries: _this.options.reconnectTries,
                reconnectInterval: _this.options.reconnectInterval,
                ha: _this.options.ha,
                haInterval: _this.options.haInterval,
                replicaSet: _this.options.replicaSet,
                acceptableLatencyMS: _this.options.acceptableLatencyMS,
                secondaryAcceptableLatencyMS: _this.options.secondaryAcceptableLatencyMS,
                connectWithNoPrimary: _this.options.connectWithNoPrimary,
                authSource: _this.options.authSource,
                w: _this.options.w,
                wtimeout: _this.options.wtimeout,
                j: _this.options.j,
                forceServerObjectId: _this.options.forceServerObjectId,
                serializeFunctions: _this.options.serializeFunctions,
                ignoreUndefined: _this.options.ignoreUndefined,
                raw: _this.options.raw,
                promoteLongs: _this.options.promoteLongs,
                promoteBuffers: _this.options.promoteBuffers,
                promoteValues: _this.options.promoteValues,
                domainsEnabled: _this.options.domainsEnabled,
                bufferMaxEntries: _this.options.bufferMaxEntries,
                readPreference: _this.options.readPreference,
                pkFactory: _this.options.pkFactory,
                promiseLibrary: _this.options.promiseLibrary,
                readConcern: _this.options.readConcern,
                maxStalenessSeconds: _this.options.maxStalenessSeconds,
                loggerLevel: _this.options.loggerLevel,
                logger: _this.options.logger
            }, function (err, dbConnection) {
                if (err)
                    return fail(err);
                _this.queryRunner = new MongoQueryRunner(_this.connection, dbConnection);
                ok();
            });
        });
    };
    MongoDriver.prototype.afterConnect = function () {
        return Promise.resolve();
    };
    /**
     * Closes connection with the database.
     */
    MongoDriver.prototype.disconnect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (ok, fail) {
                        if (!_this.queryRunner)
                            return fail(new ConnectionIsNotSetError("mongodb"));
                        var handler = function (err) { return err ? fail(err) : ok(); };
                        _this.queryRunner.databaseConnection.close(handler);
                        _this.queryRunner = undefined;
                    })];
            });
        });
    };
    /**
     * Creates a schema builder used to build and sync a schema.
     */
    MongoDriver.prototype.createSchemaBuilder = function () {
        return new MongoSchemaBuilder(this.connection);
    };
    /**
     * Creates a query runner used to execute database queries.
     */
    MongoDriver.prototype.createQueryRunner = function (mode) {
        if (mode === void 0) { mode = "master"; }
        return this.queryRunner;
    };
    /**
     * Replaces parameters in the given sql with special escaping character
     * and an array of parameter names to be passed to a query.
     */
    MongoDriver.prototype.escapeQueryWithParameters = function (sql, parameters) {
        throw new Error("This operation is not supported by Mongodb driver.");
    };
    /**
     * Escapes a column name.
     */
    MongoDriver.prototype.escape = function (columnName) {
        return columnName;
    };
    /**
     * Prepares given value to a value to be persisted, based on its column type and metadata.
     */
    MongoDriver.prototype.preparePersistentValue = function (value, columnMetadata) {
        if (columnMetadata.transformer)
            value = columnMetadata.transformer.to(value);
        return value;
    };
    /**
     * Prepares given value to a value to be persisted, based on its column type or metadata.
     */
    MongoDriver.prototype.prepareHydratedValue = function (value, columnMetadata) {
        if (columnMetadata.transformer)
            value = columnMetadata.transformer.from(value);
        return value;
    };
    /**
     * Creates a database type from a given column metadata.
     */
    MongoDriver.prototype.normalizeType = function (column) {
        throw new Error("MongoDB is schema-less, not supported by this driver.");
    };
    /**
     * Normalizes "default" value of the column.
     */
    MongoDriver.prototype.normalizeDefault = function (column) {
        throw new Error("MongoDB is schema-less, not supported by this driver.");
    };
    /**
     * Normalizes "isUnique" value of the column.
     */
    MongoDriver.prototype.normalizeIsUnique = function (column) {
        throw new Error("MongoDB is schema-less, not supported by this driver.");
    };
    /**
     * Calculates column length taking into account the default length values.
     */
    MongoDriver.prototype.getColumnLength = function (column) {
        throw new Error("MongoDB is schema-less, not supported by this driver.");
    };
    /**
     * Normalizes "default" value of the column.
     */
    MongoDriver.prototype.createFullType = function (column) {
        throw new Error("MongoDB is schema-less, not supported by this driver.");
    };
    /**
     * Obtains a new database connection to a master server.
     * Used for replication.
     * If replication is not setup then returns default connection's database connection.
     */
    MongoDriver.prototype.obtainMasterConnection = function () {
        return Promise.resolve();
    };
    /**
     * Obtains a new database connection to a slave server.
     * Used for replication.
     * If replication is not setup then returns master (default) connection's database connection.
     */
    MongoDriver.prototype.obtainSlaveConnection = function () {
        return Promise.resolve();
    };
    // -------------------------------------------------------------------------
    // Protected Methods
    // -------------------------------------------------------------------------
    /**
     * Validate driver options to make sure everything is correct and driver will be able to establish connection.
     */
    MongoDriver.prototype.validateOptions = function (options) {
        // if (!options.url) {
        //     if (!options.database)
        //         throw new DriverOptionNotSetError("database");
        // }
    };
    /**
     * Loads all driver dependencies.
     */
    MongoDriver.prototype.loadDependencies = function () {
        try {
            this.mongodb = PlatformTools.load("mongodb"); // try to load native driver dynamically
        }
        catch (e) {
            throw new DriverPackageNotInstalledError("MongoDB", "mongodb");
        }
    };
    /**
     * Builds connection url that is passed to underlying driver to perform connection to the mongodb database.
     */
    MongoDriver.prototype.buildConnectionUrl = function () {
        if (this.options.url)
            return this.options.url;
        var credentialsUrlPart = (this.options.username && this.options.password)
            ? this.options.username + ":" + this.options.password + "@"
            : "";
        return "mongodb://" + credentialsUrlPart + (this.options.host || "127.0.0.1") + ":" + (this.options.port || "27017") + "/" + this.options.database;
    };
    return MongoDriver;
}());
export { MongoDriver };

//# sourceMappingURL=MongoDriver.js.map
