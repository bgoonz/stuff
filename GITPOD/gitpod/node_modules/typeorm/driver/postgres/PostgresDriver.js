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
var ConnectionIsNotSetError_1 = require("../../error/ConnectionIsNotSetError");
var DriverPackageNotInstalledError_1 = require("../../error/DriverPackageNotInstalledError");
var DriverUtils_1 = require("../DriverUtils");
var PostgresQueryRunner_1 = require("./PostgresQueryRunner");
var DateUtils_1 = require("../../util/DateUtils");
var PlatformTools_1 = require("../../platform/PlatformTools");
var RdbmsSchemaBuilder_1 = require("../../schema-builder/RdbmsSchemaBuilder");
/**
 * Organizes communication with PostgreSQL DBMS.
 */
var PostgresDriver = /** @class */ (function () {
    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    function PostgresDriver(connection) {
        /**
         * Pool for slave databases.
         * Used in replication.
         */
        this.slaves = [];
        /**
         * We store all created query runners because we need to release them.
         */
        this.connectedQueryRunners = [];
        /**
         * Indicates if replication is enabled.
         */
        this.isReplicated = false;
        /**
         * Indicates if tree tables are supported by this driver.
         */
        this.treeSupport = true;
        /**
         * Gets list of supported column data types by a driver.
         *
         * @see https://www.tutorialspoint.com/postgresql/postgresql_data_types.htm
         * @see https://www.postgresql.org/docs/9.2/static/datatype.html
         */
        this.supportedDataTypes = [
            "smallint",
            "integer",
            "bigint",
            "decimal",
            "numeric",
            "real",
            "double precision",
            "money",
            "character varying",
            "varchar",
            "character",
            "char",
            "text",
            "citext",
            "bytea",
            "bit",
            "bit varying",
            "timestamp",
            "timestamp without time zone",
            "timestamp with time zone",
            "date",
            "time",
            "time without time zone",
            "time with time zone",
            "interval",
            "boolean",
            "enum",
            "point",
            "line",
            "lseg",
            "box",
            "path",
            "polygon",
            "circle",
            "cidr",
            "inet",
            "macaddr",
            "tsvector",
            "tsquery",
            "uuid",
            "xml",
            "json",
            "jsonb"
        ];
        /**
         * Gets list of column data types that support length by a driver.
         */
        this.withLengthColumnTypes = [
            "character varying",
            "varchar",
            "character",
            "char",
            "bit",
            "bit varying"
        ];
        /**
         * Orm has special columns and we need to know what database column types should be for those types.
         * Column types are driver dependant.
         */
        this.mappedDataTypes = {
            createDate: "timestamp",
            createDateDefault: "now()",
            updateDate: "timestamp",
            updateDateDefault: "now()",
            version: "int",
            treeLevel: "int",
            migrationName: "varchar",
            migrationTimestamp: "bigint",
            cacheId: "int",
            cacheIdentifier: "varchar",
            cacheTime: "bigint",
            cacheDuration: "int",
            cacheQuery: "text",
            cacheResult: "text",
        };
        this.connection = connection;
        this.options = connection.options;
        this.isReplicated = this.options.replication ? true : false;
        // load postgres package
        this.loadDependencies();
        // Object.assign(this.options, DriverUtils.buildDriverOptions(connection.options)); // todo: do it better way
        // validate options to make sure everything is set
        // todo: revisit validation with replication in mind
        // if (!this.options.host)
        //     throw new DriverOptionNotSetError("host");
        // if (!this.options.username)
        //     throw new DriverOptionNotSetError("username");
        // if (!this.options.database)
        //     throw new DriverOptionNotSetError("database");
    }
    // -------------------------------------------------------------------------
    // Public Implemented Methods
    // -------------------------------------------------------------------------
    /**
     * Performs connection to the database.
     * Based on pooling options, it can either create connection immediately,
     * either create a pool and create connection when needed.
     */
    PostgresDriver.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (!this.options.replication) return [3 /*break*/, 3];
                        _a = this;
                        return [4 /*yield*/, Promise.all(this.options.replication.slaves.map(function (slave) {
                                return _this.createPool(_this.options, slave);
                            }))];
                    case 1:
                        _a.slaves = _d.sent();
                        _b = this;
                        return [4 /*yield*/, this.createPool(this.options, this.options.replication.master)];
                    case 2:
                        _b.master = _d.sent();
                        this.database = this.options.replication.master.database;
                        return [3 /*break*/, 5];
                    case 3:
                        _c = this;
                        return [4 /*yield*/, this.createPool(this.options, this.options)];
                    case 4:
                        _c.master = _d.sent();
                        this.database = this.options.database;
                        _d.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Makes any action after connection (e.g. create extensions in Postgres driver).
     */
    PostgresDriver.prototype.afterConnect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var hasUuidColumns, hasCitextColumns;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        hasUuidColumns = this.connection.entityMetadatas.some(function (metadata) {
                            return metadata.generatedColumns.filter(function (column) { return column.generationStrategy === "uuid"; }).length > 0;
                        });
                        hasCitextColumns = this.connection.entityMetadatas.some(function (metadata) {
                            return metadata.columns.filter(function (column) { return column.type === "citext"; }).length > 0;
                        });
                        if (!(hasUuidColumns || hasCitextColumns)) return [3 /*break*/, 2];
                        return [4 /*yield*/, Promise.all([this.master].concat(this.slaves).map(function (pool) {
                                return new Promise(function (ok, fail) {
                                    pool.connect(function (err, connection, release) { return __awaiter(_this, void 0, void 0, function () {
                                        var logger, _1, _2;
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0:
                                                    logger = this.connection.logger;
                                                    if (err)
                                                        return [2 /*return*/, fail(err)];
                                                    if (!hasUuidColumns) return [3 /*break*/, 4];
                                                    _a.label = 1;
                                                case 1:
                                                    _a.trys.push([1, 3, , 4]);
                                                    return [4 /*yield*/, this.executeQuery(connection, "CREATE extension IF NOT EXISTS \"uuid-ossp\"")];
                                                case 2:
                                                    _a.sent();
                                                    return [3 /*break*/, 4];
                                                case 3:
                                                    _1 = _a.sent();
                                                    logger.log("warn", "At least one of the entities has uuid column, but the 'uuid-ossp' extension cannot be installed automatically. Please install it manually using superuser rights");
                                                    return [3 /*break*/, 4];
                                                case 4:
                                                    if (!hasCitextColumns) return [3 /*break*/, 8];
                                                    _a.label = 5;
                                                case 5:
                                                    _a.trys.push([5, 7, , 8]);
                                                    return [4 /*yield*/, this.executeQuery(connection, "CREATE extension IF NOT EXISTS \"citext\"")];
                                                case 6:
                                                    _a.sent();
                                                    return [3 /*break*/, 8];
                                                case 7:
                                                    _2 = _a.sent();
                                                    logger.log("warn", "At least one of the entities has citext column, but the 'citext' extension cannot be installed automatically. Please install it manually using superuser rights");
                                                    return [3 /*break*/, 8];
                                                case 8:
                                                    release();
                                                    ok();
                                                    return [2 /*return*/];
                                            }
                                        });
                                    }); });
                                });
                            }))];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/, Promise.resolve()];
                }
            });
        });
    };
    /**
     * Closes connection with database.
     */
    PostgresDriver.prototype.disconnect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.master)
                            return [2 /*return*/, Promise.reject(new ConnectionIsNotSetError_1.ConnectionIsNotSetError("postgres"))];
                        return [4 /*yield*/, this.closePool(this.master)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, Promise.all(this.slaves.map(function (slave) { return _this.closePool(slave); }))];
                    case 2:
                        _a.sent();
                        this.master = undefined;
                        this.slaves = [];
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Creates a schema builder used to build and sync a schema.
     */
    PostgresDriver.prototype.createSchemaBuilder = function () {
        return new RdbmsSchemaBuilder_1.RdbmsSchemaBuilder(this.connection);
    };
    /**
     * Creates a query runner used to execute database queries.
     */
    PostgresDriver.prototype.createQueryRunner = function (mode) {
        if (mode === void 0) { mode = "master"; }
        return new PostgresQueryRunner_1.PostgresQueryRunner(this, mode);
    };
    /**
     * Prepares given value to a value to be persisted, based on its column type and metadata.
     */
    PostgresDriver.prototype.preparePersistentValue = function (value, columnMetadata) {
        if (columnMetadata.transformer)
            value = columnMetadata.transformer.to(value);
        if (value === null || value === undefined)
            return value;
        if (columnMetadata.type === Boolean) {
            return value === true ? 1 : 0;
        }
        else if (columnMetadata.type === "date") {
            return DateUtils_1.DateUtils.mixedDateToDateString(value);
        }
        else if (columnMetadata.type === "time") {
            return DateUtils_1.DateUtils.mixedDateToTimeString(value);
        }
        else if (columnMetadata.type === "datetime"
            || columnMetadata.type === Date
            || columnMetadata.type === "timestamp"
            || columnMetadata.type === "timestamp with time zone"
            || columnMetadata.type === "timestamp without time zone") {
            return DateUtils_1.DateUtils.mixedDateToDate(value);
        }
        else if (columnMetadata.type === "json" || columnMetadata.type === "jsonb") {
            return JSON.stringify(value);
        }
        else if (columnMetadata.type === "simple-array") {
            return DateUtils_1.DateUtils.simpleArrayToString(value);
        }
        else if (columnMetadata.type === "simple-json") {
            return DateUtils_1.DateUtils.simpleJsonToString(value);
        }
        return value;
    };
    /**
     * Prepares given value to a value to be persisted, based on its column type or metadata.
     */
    PostgresDriver.prototype.prepareHydratedValue = function (value, columnMetadata) {
        if (value === null || value === undefined)
            return value;
        if (columnMetadata.type === Boolean) {
            value = value ? true : false;
        }
        else if (columnMetadata.type === "datetime"
            || columnMetadata.type === Date
            || columnMetadata.type === "timestamp"
            || columnMetadata.type === "timestamp with time zone"
            || columnMetadata.type === "timestamp without time zone") {
            value = DateUtils_1.DateUtils.normalizeHydratedDate(value);
        }
        else if (columnMetadata.type === "date") {
            value = DateUtils_1.DateUtils.mixedDateToDateString(value);
        }
        else if (columnMetadata.type === "time") {
            value = DateUtils_1.DateUtils.mixedTimeToString(value);
        }
        else if (columnMetadata.type === "simple-array") {
            value = DateUtils_1.DateUtils.stringToSimpleArray(value);
        }
        else if (columnMetadata.type === "simple-json") {
            value = DateUtils_1.DateUtils.stringToSimpleJson(value);
        }
        if (columnMetadata.transformer)
            value = columnMetadata.transformer.from(value);
        return value;
    };
    /**
     * Replaces parameters in the given sql with special escaping character
     * and an array of parameter names to be passed to a query.
     */
    PostgresDriver.prototype.escapeQueryWithParameters = function (sql, parameters) {
        if (!parameters || !Object.keys(parameters).length)
            return [sql, []];
        var builtParameters = [];
        var keys = Object.keys(parameters).map(function (parameter) { return "(:" + parameter + "\\b)"; }).join("|");
        sql = sql.replace(new RegExp(keys, "g"), function (key) {
            var value = parameters[key.substr(1)];
            if (value instanceof Array) {
                return value.map(function (v) {
                    builtParameters.push(v);
                    return "$" + builtParameters.length;
                }).join(", ");
            }
            else if (value instanceof Function) {
                return value();
            }
            else {
                builtParameters.push(value);
                return "$" + builtParameters.length;
            }
        }); // todo: make replace only in value statements, otherwise problems
        return [sql, builtParameters];
    };
    /**
     * Escapes a column name.
     */
    PostgresDriver.prototype.escape = function (columnName) {
        return "\"" + columnName + "\"";
    };
    /**
     * Creates a database type from a given column metadata.
     */
    PostgresDriver.prototype.normalizeType = function (column) {
        var type = "";
        if (column.type === Number) {
            type += "integer";
        }
        else if (column.type === String) {
            type += "character varying";
        }
        else if (column.type === Date) {
            type += "timestamp";
        }
        else if (column.type === Boolean) {
            type += "boolean";
        }
        else if (column.type === "simple-array") {
            type += "text";
        }
        else if (column.type === "simple-json") {
            type += "text";
        }
        else {
            type += column.type;
        }
        // normalize shortcuts
        if (type === "int" || type === "int4") {
            type = "integer";
        }
        else if (type === "int2") {
            type = "smallint";
        }
        else if (type === "int8") {
            type = "bigint";
        }
        else if (type === "decimal") {
            type = "numeric";
        }
        else if (type === "float8") {
            type = "double precision";
        }
        else if (type === "float4") {
            type = "real";
        }
        else if (type === "citext") {
            type = "citext";
        }
        else if (type === "char") {
            type = "character";
        }
        else if (type === "varchar") {
            type = "character varying";
        }
        else if (type === "time") {
            type = "time without time zone";
        }
        else if (type === "timetz") {
            type = "time with time zone";
        }
        else if (type === "timestamptz") {
            type = "timestamp with time zone";
        }
        else if (type === "bool") {
            type = "boolean";
        }
        else if (type === "varbit") {
            type = "bit varying";
        }
        else if (type === "timestamp") {
            type = "timestamp without time zone";
        }
        return type;
    };
    /**
     * Normalizes "default" value of the column.
     */
    PostgresDriver.prototype.normalizeDefault = function (column) {
        var arrayCast = column.isArray ? "::" + column.type + "[]" : "";
        if (typeof column.default === "number") {
            return "" + column.default;
        }
        else if (typeof column.default === "boolean") {
            return column.default === true ? "true" : "false";
        }
        else if (typeof column.default === "function") {
            return column.default();
        }
        else if (typeof column.default === "string") {
            return "'" + column.default + "'" + arrayCast;
        }
        else if (typeof column.default === "object") {
            return "'" + JSON.stringify(column.default) + "'";
        }
        else {
            return column.default;
        }
    };
    /**
     * Normalizes "isUnique" value of the column.
     */
    PostgresDriver.prototype.normalizeIsUnique = function (column) {
        return column.isUnique;
    };
    /**
     * Calculates column length taking into account the default length values.
     */
    PostgresDriver.prototype.getColumnLength = function (column) {
        if (column.length)
            return column.length;
        var normalizedType = this.normalizeType(column);
        if (this.dataTypeDefaults && this.dataTypeDefaults[normalizedType] && this.dataTypeDefaults[normalizedType].length)
            return this.dataTypeDefaults[normalizedType].length.toString();
        return "";
    };
    /**
     * Normalizes "default" value of the column.
     */
    PostgresDriver.prototype.createFullType = function (column) {
        var type = column.type;
        if (column.length) {
            type += "(" + column.length + ")";
        }
        else if (column.precision && column.scale) {
            type += "(" + column.precision + "," + column.scale + ")";
        }
        else if (column.precision) {
            type += "(" + column.precision + ")";
        }
        else if (column.scale) {
            type += "(" + column.scale + ")";
        }
        else if (this.dataTypeDefaults && this.dataTypeDefaults[column.type] && this.dataTypeDefaults[column.type].length) {
            type += "(" + this.dataTypeDefaults[column.type].length.toString() + ")";
        }
        if (column.type === "time without time zone") {
            type = "TIME" + (column.precision ? "(" + column.precision + ")" : "");
        }
        else if (column.type === "time with time zone") {
            type = "TIME" + (column.precision ? "(" + column.precision + ")" : "") + " WITH TIME ZONE";
        }
        else if (column.type === "timestamp without time zone") {
            type = "TIMESTAMP" + (column.precision ? "(" + column.precision + ")" : "");
        }
        else if (column.type === "timestamp with time zone") {
            type = "TIMESTAMP" + (column.precision ? "(" + column.precision + ")" : "") + " WITH TIME ZONE";
        }
        if (column.isArray)
            type += " array";
        return type;
    };
    /**
     * Obtains a new database connection to a master server.
     * Used for replication.
     * If replication is not setup then returns default connection's database connection.
     */
    PostgresDriver.prototype.obtainMasterConnection = function () {
        var _this = this;
        return new Promise(function (ok, fail) {
            _this.master.connect(function (err, connection, release) {
                err ? fail(err) : ok([connection, release]);
            });
        });
    };
    /**
     * Obtains a new database connection to a slave server.
     * Used for replication.
     * If replication is not setup then returns master (default) connection's database connection.
     */
    PostgresDriver.prototype.obtainSlaveConnection = function () {
        var _this = this;
        if (!this.slaves.length)
            return this.obtainMasterConnection();
        return new Promise(function (ok, fail) {
            var random = Math.floor(Math.random() * _this.slaves.length);
            _this.slaves[random].connect(function (err, connection, release) {
                err ? fail(err) : ok([connection, release]);
            });
        });
    };
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    /**
     * Loads postgres query stream package.
     */
    PostgresDriver.prototype.loadStreamDependency = function () {
        try {
            return PlatformTools_1.PlatformTools.load("pg-query-stream");
        }
        catch (e) { // todo: better error for browser env
            throw new Error("To use streams you should install pg-query-stream package. Please run npm i pg-query-stream --save command.");
        }
    };
    // -------------------------------------------------------------------------
    // Protected Methods
    // -------------------------------------------------------------------------
    /**
     * If driver dependency is not given explicitly, then try to load it via "require".
     */
    PostgresDriver.prototype.loadDependencies = function () {
        try {
            this.postgres = PlatformTools_1.PlatformTools.load("pg");
            try {
                var pgNative = PlatformTools_1.PlatformTools.load("pg-native");
                if (pgNative && this.postgres.native)
                    this.postgres = this.postgres.native;
            }
            catch (e) { }
        }
        catch (e) { // todo: better error for browser env
            throw new DriverPackageNotInstalledError_1.DriverPackageNotInstalledError("Postgres", "pg");
        }
    };
    /**
     * Creates a new connection pool for a given database credentials.
     */
    PostgresDriver.prototype.createPool = function (options, credentials) {
        return __awaiter(this, void 0, void 0, function () {
            var connectionOptions, pool, logger;
            return __generator(this, function (_a) {
                credentials = Object.assign(credentials, DriverUtils_1.DriverUtils.buildDriverOptions(credentials)); // todo: do it better way
                connectionOptions = Object.assign({}, {
                    host: credentials.host,
                    user: credentials.username,
                    password: credentials.password,
                    database: credentials.database,
                    port: credentials.port,
                    ssl: credentials.ssl
                }, options.extra || {});
                pool = new this.postgres.Pool(connectionOptions);
                logger = this.connection.logger;
                /*
                  Attaching an error handler to pool errors is essential, as, otherwise, errors raised will go unhandled and
                  cause the hosting app to crash.
                 */
                pool.on("error", function (error) { return logger.log("warn", "Postgres pool raised an error. " + error); });
                return [2 /*return*/, new Promise(function (ok, fail) {
                        pool.connect(function (err, connection, release) {
                            if (err)
                                return fail(err);
                            release();
                            ok(pool);
                        });
                    })];
            });
        });
    };
    /**
     * Closes connection pool.
     */
    PostgresDriver.prototype.closePool = function (pool) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.all(this.connectedQueryRunners.map(function (queryRunner) { return queryRunner.release(); }))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, new Promise(function (ok, fail) {
                                pool.end(function (err) { return err ? fail(err) : ok(); });
                            })];
                }
            });
        });
    };
    /**
     * Executes given query.
     */
    PostgresDriver.prototype.executeQuery = function (connection, query) {
        return new Promise(function (ok, fail) {
            connection.query(query, function (err, result) {
                if (err)
                    return fail(err);
                ok(result);
            });
        });
    };
    return PostgresDriver;
}());
exports.PostgresDriver = PostgresDriver;

//# sourceMappingURL=PostgresDriver.js.map
