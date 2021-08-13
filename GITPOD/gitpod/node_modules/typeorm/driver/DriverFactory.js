"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MissingDriverError_1 = require("../error/MissingDriverError");
var MongoDriver_1 = require("./mongodb/MongoDriver");
var WebsqlDriver_1 = require("./websql/WebsqlDriver");
var SqlServerDriver_1 = require("./sqlserver/SqlServerDriver");
var OracleDriver_1 = require("./oracle/OracleDriver");
var SqliteDriver_1 = require("./sqlite/SqliteDriver");
var CordovaDriver_1 = require("./cordova/CordovaDriver");
var SqljsDriver_1 = require("./sqljs/SqljsDriver");
var MysqlDriver_1 = require("./mysql/MysqlDriver");
var PostgresDriver_1 = require("./postgres/PostgresDriver");
/**
 * Helps to create drivers.
 */
var DriverFactory = /** @class */ (function () {
    function DriverFactory() {
    }
    /**
     * Creates a new driver depend on a given connection's driver type.
     */
    DriverFactory.prototype.create = function (connection) {
        var type = connection.options.type;
        switch (type) {
            case "mysql":
                return new MysqlDriver_1.MysqlDriver(connection);
            case "postgres":
                return new PostgresDriver_1.PostgresDriver(connection);
            case "mariadb":
                return new MysqlDriver_1.MysqlDriver(connection);
            case "sqlite":
                return new SqliteDriver_1.SqliteDriver(connection);
            case "cordova":
                return new CordovaDriver_1.CordovaDriver(connection);
            case "sqljs":
                return new SqljsDriver_1.SqljsDriver(connection);
            case "oracle":
                return new OracleDriver_1.OracleDriver(connection);
            case "mssql":
                return new SqlServerDriver_1.SqlServerDriver(connection);
            case "websql":
                return new WebsqlDriver_1.WebsqlDriver(connection);
            case "mongodb":
                return new MongoDriver_1.MongoDriver(connection);
            default:
                throw new MissingDriverError_1.MissingDriverError(type);
        }
    };
    return DriverFactory;
}());
exports.DriverFactory = DriverFactory;

//# sourceMappingURL=DriverFactory.js.map
