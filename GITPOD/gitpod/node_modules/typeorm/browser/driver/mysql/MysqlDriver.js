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
import { DriverUtils } from "../DriverUtils";
import { MysqlQueryRunner } from "./MysqlQueryRunner";
import { DateUtils } from "../../util/DateUtils";
import { PlatformTools } from "../../platform/PlatformTools";
import { RdbmsSchemaBuilder } from "../../schema-builder/RdbmsSchemaBuilder";
import { RandomGenerator } from "../../util/RandomGenerator";
/**
 * Organizes communication with MySQL DBMS.
 */
var MysqlDriver = /** @class */ (function () {
    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    function MysqlDriver(connection) {
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
         * @see https://www.tutorialspoint.com/mysql/mysql-data-types.htm
         * @see https://dev.mysql.com/doc/refman/5.7/en/data-types.html
         */
        this.supportedDataTypes = [
            "int",
            "tinyint",
            "smallint",
            "mediumint",
            "bigint",
            "float",
            "double",
            "decimal",
            "date",
            "datetime",
            "timestamp",
            "time",
            "year",
            "char",
            "varchar",
            "blob",
            "text",
            "tinyblob",
            "tinytext",
            "mediumblob",
            "mediumtext",
            "longblob",
            "longtext",
            "enum",
            "json"
        ];
        /**
         * Gets list of column data types that support length by a driver.
         */
        this.withLengthColumnTypes = [
            "int",
            "tinyint",
            "smallint",
            "mediumint",
            "bigint",
            "char",
            "varchar",
            "blob",
            "text"
        ];
        /**
         * ORM has special columns and we need to know what database column types should be for those columns.
         * Column types are driver dependant.
         */
        this.mappedDataTypes = {
            createDate: "datetime",
            createDatePrecision: 6,
            createDateDefault: "CURRENT_TIMESTAMP(6)",
            updateDate: "datetime",
            updateDatePrecision: 6,
            updateDateDefault: "CURRENT_TIMESTAMP(6)",
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
        /**
         * Default values of length, precision and scale depends on column data type.
         * Used in the cases when length/precision/scale is not specified by user.
         */
        this.dataTypeDefaults = {
            varchar: { length: 255 },
            int: { length: 11 },
            tinyint: { length: 4 },
            smallint: { length: 5 },
            mediumint: { length: 9 },
            bigint: { length: 20 },
            year: { length: 4 }
        };
        this.connection = connection;
        this.options = connection.options;
        this.isReplicated = this.options.replication ? true : false;
        // load mysql package
        this.loadDependencies();
        // validate options to make sure everything is set
        // todo: revisit validation with replication in mind
        // if (!(this.options.host || (this.options.extra && this.options.extra.socketPath)) && !this.options.socketPath)
        //     throw new DriverOptionNotSetError("socketPath and host");
        // if (!this.options.username)
        //     throw new DriverOptionNotSetError("username");
        // if (!this.options.database)
        //     throw new DriverOptionNotSetError("database");
        // todo: check what is going on when connection is setup without database and how to connect to a database then?
        // todo: provide options to auto-create a database if it does not exist yet
    }
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    /**
     * Performs connection to the database.
     */
    MysqlDriver.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.options.replication) return [3 /*break*/, 1];
                        this.poolCluster = this.mysql.createPoolCluster(this.options.replication);
                        this.options.replication.slaves.forEach(function (slave, index) {
                            _this.poolCluster.add("SLAVE" + index, _this.createConnectionOptions(_this.options, slave));
                        });
                        this.poolCluster.add("MASTER", this.createConnectionOptions(this.options, this.options.replication.master));
                        this.database = this.options.replication.master.database;
                        return [3 /*break*/, 3];
                    case 1:
                        _a = this;
                        return [4 /*yield*/, this.createPool(this.createConnectionOptions(this.options, this.options))];
                    case 2:
                        _a.pool = _b.sent();
                        this.database = this.options.database;
                        _b.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Makes any action after connection (e.g. create extensions in Postgres driver).
     */
    MysqlDriver.prototype.afterConnect = function () {
        return Promise.resolve();
    };
    /**
     * Closes connection with the database.
     */
    MysqlDriver.prototype.disconnect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (!this.poolCluster && !this.pool)
                    return [2 /*return*/, Promise.reject(new ConnectionIsNotSetError("mysql"))];
                if (this.poolCluster) {
                    return [2 /*return*/, new Promise(function (ok, fail) {
                            _this.poolCluster.end(function (err) { return err ? fail(err) : ok(); });
                            _this.poolCluster = undefined;
                        })];
                }
                if (this.pool) {
                    return [2 /*return*/, new Promise(function (ok, fail) {
                            _this.pool.end(function (err) {
                                if (err)
                                    return fail(err);
                                _this.pool = undefined;
                                ok();
                            });
                        })];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Creates a schema builder used to build and sync a schema.
     */
    MysqlDriver.prototype.createSchemaBuilder = function () {
        return new RdbmsSchemaBuilder(this.connection);
    };
    /**
     * Creates a query runner used to execute database queries.
     */
    MysqlDriver.prototype.createQueryRunner = function (mode) {
        if (mode === void 0) { mode = "master"; }
        return new MysqlQueryRunner(this, mode);
    };
    /**
     * Replaces parameters in the given sql with special escaping character
     * and an array of parameter names to be passed to a query.
     */
    MysqlDriver.prototype.escapeQueryWithParameters = function (sql, parameters) {
        if (!parameters || !Object.keys(parameters).length)
            return [sql, []];
        var escapedParameters = [];
        var keys = Object.keys(parameters).map(function (parameter) { return "(:" + parameter + "\\b)"; }).join("|");
        sql = sql.replace(new RegExp(keys, "g"), function (key) {
            var value = parameters[key.substr(1)];
            if (value instanceof Function) {
                return value();
            }
            else {
                escapedParameters.push(parameters[key.substr(1)]);
                return "?";
            }
        }); // todo: make replace only in value statements, otherwise problems
        return [sql, escapedParameters];
    };
    /**
     * Escapes a column name.
     */
    MysqlDriver.prototype.escape = function (columnName) {
        return "`" + columnName + "`";
    };
    /**
     * Prepares given value to a value to be persisted, based on its column type and metadata.
     */
    MysqlDriver.prototype.preparePersistentValue = function (value, columnMetadata) {
        if (columnMetadata.transformer)
            value = columnMetadata.transformer.to(value);
        if (value === null || value === undefined)
            return value;
        if (columnMetadata.type === Boolean) {
            return value === true ? 1 : 0;
        }
        else if (columnMetadata.type === "date") {
            return DateUtils.mixedDateToDateString(value);
        }
        else if (columnMetadata.type === "time") {
            return DateUtils.mixedDateToTimeString(value);
        }
        else if (columnMetadata.type === "json") {
            return JSON.stringify(value);
        }
        else if (columnMetadata.type === "timestamp" || columnMetadata.type === "datetime" || columnMetadata.type === Date) {
            return DateUtils.mixedDateToDate(value);
        }
        else if (columnMetadata.isGenerated && columnMetadata.generationStrategy === "uuid" && !value) {
            return RandomGenerator.uuid4();
        }
        else if (columnMetadata.type === "simple-array") {
            return DateUtils.simpleArrayToString(value);
        }
        else if (columnMetadata.type === "simple-json") {
            return DateUtils.simpleJsonToString(value);
        }
        return value;
    };
    /**
     * Prepares given value to a value to be persisted, based on its column type or metadata.
     */
    MysqlDriver.prototype.prepareHydratedValue = function (value, columnMetadata) {
        if (value === null || value === undefined)
            return value;
        if (columnMetadata.type === Boolean) {
            value = value ? true : false;
        }
        else if (columnMetadata.type === "datetime" || columnMetadata.type === Date) {
            value = DateUtils.normalizeHydratedDate(value);
        }
        else if (columnMetadata.type === "date") {
            value = DateUtils.mixedDateToDateString(value);
        }
        else if (columnMetadata.type === "json") {
            value = typeof value === "string" ? JSON.parse(value) : value;
        }
        else if (columnMetadata.type === "time") {
            value = DateUtils.mixedTimeToString(value);
        }
        else if (columnMetadata.type === "simple-array") {
            value = DateUtils.stringToSimpleArray(value);
        }
        else if (columnMetadata.type === "simple-json") {
            value = DateUtils.stringToSimpleJson(value);
        }
        if (columnMetadata.transformer)
            value = columnMetadata.transformer.from(value);
        return value;
    };
    /**
     * Creates a database type from a given column metadata.
     */
    MysqlDriver.prototype.normalizeType = function (column) {
        if (column.type === Number || column.type === "integer") {
            return "int";
        }
        else if (column.type === String) {
            return "varchar";
        }
        else if (column.type === Date) {
            return "datetime";
        }
        else if (column.type === Buffer) {
            return "blob";
        }
        else if (column.type === Boolean) {
            return "tinyint";
        }
        else if (column.type === "uuid") {
            return "varchar";
        }
        else if (column.type === "simple-array") {
            return "text";
        }
        else if (column.type === "simple-json") {
            return "text";
        }
        else {
            return column.type || "";
        }
    };
    /**
     * Normalizes "default" value of the column.
     */
    MysqlDriver.prototype.normalizeDefault = function (column) {
        if (typeof column.default === "number") {
            return "" + column.default;
        }
        else if (typeof column.default === "boolean") {
            return column.default === true ? "1" : "0";
        }
        else if (typeof column.default === "function") {
            return column.default();
        }
        else if (typeof column.default === "string") {
            return "'" + column.default + "'";
        }
        else {
            return column.default;
        }
    };
    /**
     * Normalizes "isUnique" value of the column.
     */
    MysqlDriver.prototype.normalizeIsUnique = function (column) {
        return column.isUnique ||
            !!column.entityMetadata.indices.find(function (index) { return index.isUnique && index.columns.length === 1 && index.columns[0] === column; });
    };
    /**
     * Calculates column length taking into account the default length values.
     */
    MysqlDriver.prototype.getColumnLength = function (column) {
        if (column.length)
            return column.length;
        var normalizedType = this.normalizeType(column);
        if (this.dataTypeDefaults && this.dataTypeDefaults[normalizedType] && this.dataTypeDefaults[normalizedType].length)
            return this.dataTypeDefaults[normalizedType].length.toString();
        return "";
    };
    MysqlDriver.prototype.createFullType = function (column) {
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
        if (column.isArray)
            type += " array";
        return type;
    };
    /**
     * Obtains a new database connection to a master server.
     * Used for replication.
     * If replication is not setup then returns default connection's database connection.
     */
    MysqlDriver.prototype.obtainMasterConnection = function () {
        var _this = this;
        return new Promise(function (ok, fail) {
            if (_this.poolCluster) {
                _this.poolCluster.getConnection("MASTER", function (err, dbConnection) {
                    err ? fail(err) : ok(_this.prepareDbConnection(dbConnection));
                });
            }
            else if (_this.pool) {
                _this.pool.getConnection(function (err, dbConnection) {
                    err ? fail(err) : ok(_this.prepareDbConnection(dbConnection));
                });
            }
            else {
                fail(new Error("Connection is not established with mysql database"));
            }
        });
    };
    /**
     * Obtains a new database connection to a slave server.
     * Used for replication.
     * If replication is not setup then returns master (default) connection's database connection.
     */
    MysqlDriver.prototype.obtainSlaveConnection = function () {
        var _this = this;
        if (!this.poolCluster)
            return this.obtainMasterConnection();
        return new Promise(function (ok, fail) {
            _this.poolCluster.getConnection("SLAVE*", function (err, dbConnection) {
                err ? fail(err) : ok(dbConnection);
            });
        });
    };
    // -------------------------------------------------------------------------
    // Protected Methods
    // -------------------------------------------------------------------------
    /**
     * Loads all driver dependencies.
     */
    MysqlDriver.prototype.loadDependencies = function () {
        try {
            this.mysql = PlatformTools.load("mysql"); // try to load first supported package
        }
        catch (e) {
            try {
                this.mysql = PlatformTools.load("mysql2"); // try to load second supported package
            }
            catch (e) {
                throw new DriverPackageNotInstalledError("Mysql", "mysql");
            }
        }
    };
    /**
     * Creates a new connection pool for a given database credentials.
     */
    MysqlDriver.prototype.createConnectionOptions = function (options, credentials) {
        credentials = Object.assign(credentials, DriverUtils.buildDriverOptions(credentials)); // todo: do it better way
        // build connection options for the driver
        return Object.assign({}, {
            charset: options.charset,
            timezone: options.timezone,
            connectTimeout: options.connectTimeout,
            insecureAuth: options.insecureAuth,
            supportBigNumbers: options.supportBigNumbers,
            bigNumberStrings: options.bigNumberStrings,
            dateStrings: options.dateStrings,
            debug: options.debug,
            trace: options.trace,
            multipleStatements: options.multipleStatements,
            flags: options.flags
        }, {
            host: credentials.host,
            user: credentials.username,
            password: credentials.password,
            database: credentials.database,
            port: credentials.port,
            ssl: options.ssl
        }, options.extra || {});
    };
    /**
     * Creates a new connection pool for a given database credentials.
     */
    MysqlDriver.prototype.createPool = function (connectionOptions) {
        // create a connection pool
        var pool = this.mysql.createPool(connectionOptions);
        // make sure connection is working fine
        return new Promise(function (ok, fail) {
            // (issue #610) we make first connection to database to make sure if connection credentials are wrong
            // we give error before calling any other method that creates actual query runner
            pool.getConnection(function (err, connection) {
                if (err)
                    return pool.end(function () { return fail(err); });
                connection.release();
                ok(pool);
            });
        });
    };
    /**
     * Attaches all required base handlers to a database connection, such as the unhandled error handler.
     */
    MysqlDriver.prototype.prepareDbConnection = function (connection) {
        var logger = this.connection.logger;
        /*
          Attaching an error handler to connection errors is essential, as, otherwise, errors raised will go unhandled and
          cause the hosting app to crash.
         */
        if (connection.listeners("error").length === 0) {
            connection.on("error", function (error) { return logger.log("warn", "MySQL connection raised an error. " + error); });
        }
        return connection;
    };
    return MysqlDriver;
}());
export { MysqlDriver };

//# sourceMappingURL=MysqlDriver.js.map
