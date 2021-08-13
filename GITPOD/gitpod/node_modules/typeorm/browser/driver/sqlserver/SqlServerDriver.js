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
import { SqlServerQueryRunner } from "./SqlServerQueryRunner";
import { DateUtils } from "../../util/DateUtils";
import { PlatformTools } from "../../platform/PlatformTools";
import { RdbmsSchemaBuilder } from "../../schema-builder/RdbmsSchemaBuilder";
import { MssqlParameter } from "./MssqlParameter";
/**
 * Organizes communication with SQL Server DBMS.
 */
var SqlServerDriver = /** @class */ (function () {
    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    function SqlServerDriver(connection) {
        /**
         * Pool for slave databases.
         * Used in replication.
         */
        this.slaves = [];
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
         * @see https://docs.microsoft.com/en-us/sql/t-sql/data-types/data-types-transact-sql
         */
        this.supportedDataTypes = [
            "bigint",
            "bit",
            "decimal",
            "int",
            "money",
            "numeric",
            "smallint",
            "smallmoney",
            "tinyint",
            "float",
            "real",
            "date",
            "datetime2",
            "datetime",
            "datetimeoffset",
            "smalldatetime",
            "time",
            "char",
            "text",
            "varchar",
            "nchar",
            "ntext",
            "nvarchar",
            "binary",
            "image",
            "varbinary",
            "cursor",
            "hierarchyid",
            "sql_variant",
            "table",
            "timestamp",
            "uniqueidentifier",
            "xml"
        ];
        /**
         * Gets list of column data types that support length by a driver.
         */
        this.withLengthColumnTypes = [
            "char",
            "varchar",
            "nchar",
            "nvarchar",
            "binary",
            "varbinary"
        ];
        /**
         * Orm has special columns and we need to know what database column types should be for those types.
         * Column types are driver dependant.
         */
        this.mappedDataTypes = {
            createDate: "datetime2",
            createDateDefault: "getdate()",
            updateDate: "datetime2",
            updateDateDefault: "getdate()",
            version: "int",
            treeLevel: "int",
            migrationName: "varchar",
            migrationTimestamp: "bigint",
            cacheId: "int",
            cacheIdentifier: "nvarchar",
            cacheTime: "bigint",
            cacheDuration: "int",
            cacheQuery: "nvarchar(MAX)",
            cacheResult: "nvarchar(MAX)",
        };
        /**
         * Default values of length, precision and scale depends on column data type.
         * Used in the cases when length/precision/scale is not specified by user.
         */
        this.dataTypeDefaults = {
            varchar: { length: 255 },
            nvarchar: { length: 255 }
        };
        this.connection = connection;
        this.options = connection.options;
        this.isReplicated = this.options.replication ? true : false;
        // load mssql package
        this.loadDependencies();
        // Object.assign(connection.options, DriverUtils.buildDriverOptions(connection.options)); // todo: do it better way
        // validate options to make sure everything is set
        // if (!this.options.host)
        // throw new DriverOptionNotSetError("host");
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
    SqlServerDriver.prototype.connect = function () {
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
    SqlServerDriver.prototype.afterConnect = function () {
        return Promise.resolve();
    };
    /**
     * Closes connection with the database.
     */
    SqlServerDriver.prototype.disconnect = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!this.master)
                    return [2 /*return*/, Promise.reject(new ConnectionIsNotSetError("mssql"))];
                this.master.close();
                this.slaves.forEach(function (slave) { return slave.close(); });
                this.master = undefined;
                this.slaves = [];
                return [2 /*return*/];
            });
        });
    };
    /**
     * Creates a schema builder used to build and sync a schema.
     */
    SqlServerDriver.prototype.createSchemaBuilder = function () {
        return new RdbmsSchemaBuilder(this.connection);
    };
    /**
     * Creates a query runner used to execute database queries.
     */
    SqlServerDriver.prototype.createQueryRunner = function (mode) {
        if (mode === void 0) { mode = "master"; }
        return new SqlServerQueryRunner(this, mode);
    };
    /**
     * Replaces parameters in the given sql with special escaping character
     * and an array of parameter names to be passed to a query.
     */
    SqlServerDriver.prototype.escapeQueryWithParameters = function (sql, parameters) {
        if (!parameters || !Object.keys(parameters).length)
            return [sql, []];
        var escapedParameters = [];
        var keys = Object.keys(parameters).map(function (parameter) { return "(:" + parameter + "\\b)"; }).join("|");
        sql = sql.replace(new RegExp(keys, "g"), function (key) {
            var value = parameters[key.substr(1)];
            if (value instanceof Array) {
                return value.map(function (v) {
                    escapedParameters.push(v);
                    return "@" + (escapedParameters.length - 1);
                }).join(", ");
            }
            else if (value instanceof Function) {
                return value();
            }
            else {
                escapedParameters.push(value);
                return "@" + (escapedParameters.length - 1);
            }
        }); // todo: make replace only in value statements, otherwise problems
        return [sql, escapedParameters];
    };
    /**
     * Escapes a column name.
     */
    SqlServerDriver.prototype.escape = function (columnName) {
        return "\"" + columnName + "\"";
    };
    /**
     * Prepares given value to a value to be persisted, based on its column type and metadata.
     */
    SqlServerDriver.prototype.preparePersistentValue = function (value, columnMetadata) {
        if (columnMetadata.transformer)
            value = columnMetadata.transformer.to(value);
        if (value === null || value === undefined)
            return value;
        if (columnMetadata.type === Boolean) {
            return value === true ? 1 : 0;
        }
        else if (columnMetadata.type === "date") {
            return DateUtils.mixedDateToDate(value);
        }
        else if (columnMetadata.type === "time") {
            return DateUtils.mixedTimeToDate(value);
        }
        else if (columnMetadata.type === "datetime"
            || columnMetadata.type === "smalldatetime"
            || columnMetadata.type === Date) {
            return DateUtils.mixedDateToDate(value, false, false);
        }
        else if (columnMetadata.type === "datetime2"
            || columnMetadata.type === "datetimeoffset") {
            return DateUtils.mixedDateToDate(value, false, true);
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
    SqlServerDriver.prototype.prepareHydratedValue = function (value, columnMetadata) {
        if (value === null || value === undefined)
            return value;
        if (columnMetadata.type === Boolean) {
            value = value ? true : false;
        }
        else if (columnMetadata.type === "datetime"
            || columnMetadata.type === Date
            || columnMetadata.type === "datetime2"
            || columnMetadata.type === "smalldatetime"
            || columnMetadata.type === "datetimeoffset") {
            value = DateUtils.normalizeHydratedDate(value);
        }
        else if (columnMetadata.type === "date") {
            value = DateUtils.mixedDateToDateString(value);
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
    SqlServerDriver.prototype.normalizeType = function (column) {
        if (column.type === Number) {
            return "int";
        }
        else if (column.type === String) {
            return "nvarchar";
        }
        else if (column.type === Date) {
            return "datetime";
        }
        else if (column.type === Boolean) {
            return "bit";
        }
        else if (column.type === Buffer) {
            return "binary";
        }
        else if (column.type === "uuid") {
            return "uniqueidentifier";
        }
        else if (column.type === "simple-array") {
            return "ntext";
        }
        else if (column.type === "simple-json") {
            return "ntext";
        }
        else if (column.type === "integer") {
            return "int";
        }
        else if (column.type === "dec") {
            return "decimal";
        }
        else if (column.type === "float" && (column.precision && (column.precision >= 1 && column.precision < 25))) {
            return "real";
        }
        else if (column.type === "double precision") {
            return "float";
        }
        else {
            return column.type || "";
        }
    };
    /**
     * Normalizes "default" value of the column.
     */
    SqlServerDriver.prototype.normalizeDefault = function (column) {
        if (typeof column.default === "number") {
            return "" + column.default;
        }
        else if (typeof column.default === "boolean") {
            return column.default === true ? "1" : "0";
        }
        else if (typeof column.default === "function") {
            return "(" + column.default() + ")";
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
    SqlServerDriver.prototype.normalizeIsUnique = function (column) {
        return column.isUnique;
    };
    /**
     * Calculates column length taking into account the default length values.
     */
    SqlServerDriver.prototype.getColumnLength = function (column) {
        if (column.length)
            return column.length;
        var normalizedType = this.normalizeType(column);
        if (this.dataTypeDefaults && this.dataTypeDefaults[normalizedType] && this.dataTypeDefaults[normalizedType].length)
            return this.dataTypeDefaults[normalizedType].length.toString();
        return "";
    };
    SqlServerDriver.prototype.createFullType = function (column) {
        var type = column.type;
        if (column.length) {
            type += "(" + column.length + ")";
        }
        else if (column.precision && column.scale) {
            type += "(" + column.precision + "," + column.scale + ")";
        }
        else if (column.precision && column.type !== "real") {
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
    SqlServerDriver.prototype.obtainMasterConnection = function () {
        return Promise.resolve(this.master);
    };
    /**
     * Obtains a new database connection to a slave server.
     * Used for replication.
     * If replication is not setup then returns master (default) connection's database connection.
     */
    SqlServerDriver.prototype.obtainSlaveConnection = function () {
        if (!this.slaves.length)
            return this.obtainMasterConnection();
        var random = Math.floor(Math.random() * this.slaves.length);
        return Promise.resolve(this.slaves[random]);
    };
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    /**
     * Sql server's parameters needs to be wrapped into special object with type information about this value.
     * This method wraps given value into MssqlParameter based on its column definition.
     */
    SqlServerDriver.prototype.parametrizeValue = function (column, value) {
        // if its already MssqlParameter then simply return it
        if (value instanceof MssqlParameter)
            return value;
        var normalizedType = this.normalizeType({ type: column.type });
        if (column.length) {
            return new MssqlParameter(value, normalizedType, column.length);
        }
        else if (column.precision && column.scale) {
            return new MssqlParameter(value, normalizedType, column.precision, column.scale);
        }
        else if (column.precision) {
            return new MssqlParameter(value, normalizedType, column.precision);
        }
        else if (column.scale) {
            return new MssqlParameter(value, normalizedType, column.scale);
        }
        return new MssqlParameter(value, normalizedType);
    };
    /**
     * Sql server's parameters needs to be wrapped into special object with type information about this value.
     * This method wraps all values of the given object into MssqlParameter based on their column definitions in the given table.
     */
    SqlServerDriver.prototype.parametrizeMap = function (tablePath, map) {
        var _this = this;
        // find metadata for the given table
        if (!this.connection.hasMetadata(tablePath)) // if no metadata found then we can't proceed because we don't have columns and their types
            return map;
        var metadata = this.connection.getMetadata(tablePath);
        return Object.keys(map).reduce(function (newMap, key) {
            var value = map[key];
            // find column metadata
            var column = metadata.findColumnWithDatabaseName(key);
            if (!column) // if we didn't find a column then we can't proceed because we don't have a column type
                return value;
            newMap[key] = _this.parametrizeValue(column, value);
            return newMap;
        }, {});
    };
    // -------------------------------------------------------------------------
    // Protected Methods
    // -------------------------------------------------------------------------
    /**
     * If driver dependency is not given explicitly, then try to load it via "require".
     */
    SqlServerDriver.prototype.loadDependencies = function () {
        try {
            this.mssql = PlatformTools.load("mssql");
        }
        catch (e) { // todo: better error for browser env
            throw new DriverPackageNotInstalledError("SQL Server", "mssql");
        }
    };
    /**
     * Creates a new connection pool for a given database credentials.
     */
    SqlServerDriver.prototype.createPool = function (options, credentials) {
        var _this = this;
        credentials = Object.assign(credentials, DriverUtils.buildDriverOptions(credentials)); // todo: do it better way
        // build connection options for the driver
        var connectionOptions = Object.assign({}, {
            connectionTimeout: this.options.connectionTimeout,
            requestTimeout: this.options.requestTimeout,
            stream: this.options.stream,
            pool: this.options.pool,
            options: this.options.options,
        }, {
            server: credentials.host,
            user: credentials.username,
            password: credentials.password,
            database: credentials.database,
            port: credentials.port,
            domain: credentials.domain,
        }, options.extra || {});
        // set default useUTC option if it hasn't been set
        if (!connectionOptions.options)
            connectionOptions.options = { useUTC: false };
        else if (!connectionOptions.options.useUTC)
            connectionOptions.options.useUTC = false;
        // pooling is enabled either when its set explicitly to true,
        // either when its not defined at all (e.g. enabled by default)
        return new Promise(function (ok, fail) {
            var pool = new _this.mssql.ConnectionPool(connectionOptions);
            var logger = _this.connection.logger;
            /*
              Attaching an error handler to pool errors is essential, as, otherwise, errors raised will go unhandled and
              cause the hosting app to crash.
             */
            pool.on("error", function (error) { return logger.log("warn", "MSSQL pool raised an error. " + error); });
            var connection = pool.connect(function (err) {
                if (err)
                    return fail(err);
                ok(connection);
            });
        });
    };
    return SqlServerDriver;
}());
export { SqlServerDriver };

//# sourceMappingURL=SqlServerDriver.js.map
