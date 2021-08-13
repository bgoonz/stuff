"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var DriverUtils_1 = require("../DriverUtils");
var DriverOptionNotSetError_1 = require("../../error/DriverOptionNotSetError");
var WebsqlQueryRunner_1 = require("./WebsqlQueryRunner");
var AbstractSqliteDriver_1 = require("../sqlite-abstract/AbstractSqliteDriver");
/**
 * Organizes communication with WebSQL in the browser.
 */
var WebsqlDriver = /** @class */ (function (_super) {
    __extends(WebsqlDriver, _super);
    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    function WebsqlDriver(connection) {
        var _this = _super.call(this, connection) || this;
        _this.options = connection.options;
        Object.assign(connection.options, DriverUtils_1.DriverUtils.buildDriverOptions(connection.options)); // todo: do it better way
        _this.database = _this.options.database;
        // validate options to make sure everything is set
        // if (!this.options.host)
        //     throw new DriverOptionNotSetError("host");
        // if (!this.options.username)
        //     throw new DriverOptionNotSetError("username");
        if (!_this.options.database)
            throw new DriverOptionNotSetError_1.DriverOptionNotSetError("database");
        return _this;
        // todo: what about extra options: version, description, size
    }
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    /**
     * Performs connection to the database.
     */
    WebsqlDriver.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Promise.resolve()];
            });
        });
    };
    /**
     * Closes connection with the database.
     */
    WebsqlDriver.prototype.disconnect = function () {
        return Promise.resolve();
        // if (!this.databaseConnection)
        //     throw new ConnectionIsNotSetError("websql");
        // return new Promise<void>((ok, fail) => {
        // const handler = (err: any) => err ? fail(err) : ok();
        // todo: find out how to close connection
        // ok();
        // });
    };
    /**
     * Creates a query runner used to execute database queries.
     */
    WebsqlDriver.prototype.createQueryRunner = function (mode) {
        if (mode === void 0) { mode = "master"; }
        return new WebsqlQueryRunner_1.WebsqlQueryRunner(this);
    };
    /**
     * Prepares given value to a value to be persisted, based on its column type and metadata.
     */
    WebsqlDriver.prototype.preparePersistentValue = function (value, columnMetadata) {
        if (columnMetadata.type === "json") {
            return JSON.stringify(value);
        }
        return _super.prototype.preparePersistentValue.call(this, value, columnMetadata);
    };
    /**
     * Prepares given value to a value to be persisted, based on its column type or metadata.
     */
    WebsqlDriver.prototype.prepareHydratedValue = function (value, columnMetadata) {
        if (columnMetadata.type === "json") {
            return JSON.parse(value);
        }
        return _super.prototype.prepareHydratedValue.call(this, value, columnMetadata);
    };
    /**
     * Replaces parameters in the given sql with special escaping character
     * and an array of parameter names to be passed to a query.
     */
    WebsqlDriver.prototype.escapeQueryWithParameters = function (sql, parameters) {
        if (!parameters || !Object.keys(parameters).length)
            return [sql, []];
        var escapedParameters = [];
        var keys = Object.keys(parameters).map(function (parameter) { return "(:" + parameter + "\\b)"; }).join("|");
        sql = sql.replace(new RegExp(keys, "g"), function (key) {
            var value = parameters[key.substr(1)];
            if (value instanceof Function) {
                return value();
            }
            // Websql doesn't support queries boolean values. Therefore 1 and 0 has to be used.
            else if ((typeof value) === "boolean") {
                escapedParameters.push((value ? 1 : 0));
                return "?";
            }
            else {
                escapedParameters.push(value);
                return "?";
            }
        }); // todo: make replace only in value statements, otherwise problems
        return [sql, escapedParameters];
    };
    /**
     * Escapes a column name.
     */
    WebsqlDriver.prototype.escape = function (columnName) {
        return columnName; // "`" + columnName + "`";
    };
    return WebsqlDriver;
}(AbstractSqliteDriver_1.AbstractSqliteDriver));
exports.WebsqlDriver = WebsqlDriver;

//# sourceMappingURL=WebsqlDriver.js.map
