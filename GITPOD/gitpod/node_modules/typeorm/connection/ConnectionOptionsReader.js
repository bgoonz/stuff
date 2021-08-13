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
var PlatformTools_1 = require("../platform/PlatformTools");
var ConnectionOptionsEnvReader_1 = require("./options-reader/ConnectionOptionsEnvReader");
var ConnectionOptionsYmlReader_1 = require("./options-reader/ConnectionOptionsYmlReader");
var ConnectionOptionsXmlReader_1 = require("./options-reader/ConnectionOptionsXmlReader");
/**
 * Reads connection options from the ormconfig.
 * Can read from multiple file extensions including env, json, js, xml and yml.
 */
var ConnectionOptionsReader = /** @class */ (function () {
    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    function ConnectionOptionsReader(options) {
        this.options = options;
    }
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    /**
     * Returns all connection options read from the ormconfig.
     */
    ConnectionOptionsReader.prototype.all = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.load()];
            });
        });
    };
    /**
     * Gets a connection with a given name read from ormconfig.
     * If connection with such name would not be found then it throw error.
     */
    ConnectionOptionsReader.prototype.get = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            var allOptions, targetOptions;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.all()];
                    case 1:
                        allOptions = _a.sent();
                        targetOptions = allOptions.find(function (options) { return options.name === name || (name === "default" && !options.name); });
                        if (!targetOptions)
                            throw new Error("Cannot find connection " + name + " because its not defined in any orm configuration files.");
                        return [2 /*return*/, targetOptions];
                }
            });
        });
    };
    // -------------------------------------------------------------------------
    // Protected Methods
    // -------------------------------------------------------------------------
    /**
     * Loads all connection options from a configuration file.
     *
     * todo: get in count NODE_ENV somehow
     */
    ConnectionOptionsReader.prototype.load = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var foundFileFormat, dotenv, dotenv, connectionOptions;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        foundFileFormat = ["env", "js", "json", "yml", "yaml", "xml"].find(function (format) {
                            return PlatformTools_1.PlatformTools.fileExist(_this.baseFilePath + "." + format);
                        });
                        // if .env file found then load all its variables into process.env using dotenv package
                        if (foundFileFormat === "env") {
                            dotenv = PlatformTools_1.PlatformTools.load("dotenv");
                            dotenv.config({ path: this.baseFilePath + ".env" });
                        }
                        else if (PlatformTools_1.PlatformTools.fileExist(".env")) {
                            dotenv = PlatformTools_1.PlatformTools.load("dotenv");
                            dotenv.config({ path: ".env" });
                        }
                        if (!PlatformTools_1.PlatformTools.getEnvVariable("TYPEORM_CONNECTION")) return [3 /*break*/, 1];
                        connectionOptions = new ConnectionOptionsEnvReader_1.ConnectionOptionsEnvReader().read();
                        return [3 /*break*/, 8];
                    case 1:
                        if (!(foundFileFormat === "js")) return [3 /*break*/, 2];
                        connectionOptions = PlatformTools_1.PlatformTools.load(this.baseFilePath + ".js");
                        return [3 /*break*/, 8];
                    case 2:
                        if (!(foundFileFormat === "json")) return [3 /*break*/, 3];
                        connectionOptions = PlatformTools_1.PlatformTools.load(this.baseFilePath + ".json");
                        return [3 /*break*/, 8];
                    case 3:
                        if (!(foundFileFormat === "yml")) return [3 /*break*/, 4];
                        connectionOptions = new ConnectionOptionsYmlReader_1.ConnectionOptionsYmlReader().read(this.baseFilePath + ".yml");
                        return [3 /*break*/, 8];
                    case 4:
                        if (!(foundFileFormat === "yaml")) return [3 /*break*/, 5];
                        connectionOptions = new ConnectionOptionsYmlReader_1.ConnectionOptionsYmlReader().read(this.baseFilePath + ".yaml");
                        return [3 /*break*/, 8];
                    case 5:
                        if (!(foundFileFormat === "xml")) return [3 /*break*/, 7];
                        return [4 /*yield*/, new ConnectionOptionsXmlReader_1.ConnectionOptionsXmlReader().read(this.baseFilePath + ".xml")];
                    case 6:
                        connectionOptions = _a.sent();
                        return [3 /*break*/, 8];
                    case 7: throw new Error("No connection options were found in any of configurations file.");
                    case 8: 
                    // normalize and return connection options
                    return [2 /*return*/, this.normalizeConnectionOptions(connectionOptions)];
                }
            });
        });
    };
    /**
     * Normalize connection options.
     */
    ConnectionOptionsReader.prototype.normalizeConnectionOptions = function (connectionOptions) {
        var _this = this;
        if (!(connectionOptions instanceof Array))
            connectionOptions = [connectionOptions];
        connectionOptions.forEach(function (options) {
            if (options.entities) {
                var entities = options.entities.map(function (entity) {
                    if (typeof entity === "string" && entity.substr(0, 1) !== "/")
                        return _this.baseFilePath + "/" + entity;
                    return entity;
                });
                Object.assign(connectionOptions, { entities: entities });
            }
            if (options.subscribers) {
                var subscribers = options.subscribers.map(function (subscriber) {
                    if (typeof subscriber === "string" && subscriber.substr(0, 1) !== "/")
                        return _this.baseFilePath + "/" + subscriber;
                    return subscriber;
                });
                Object.assign(connectionOptions, { subscribers: subscribers });
            }
            if (options.migrations) {
                var migrations = options.migrations.map(function (migration) {
                    if (typeof migration === "string" && migration.substr(0, 1) !== "/")
                        return _this.baseFilePath + "/" + migration;
                    return migration;
                });
                Object.assign(connectionOptions, { migrations: migrations });
            }
            // make database path file in sqlite relative to package.json
            if (options.type === "sqlite") {
                if (typeof options.database === "string" && options.database.substr(0, 1) !== "/" && options.database !== ":memory:") {
                    Object.assign(options, {
                        database: _this.baseDirectory + "/" + options.database
                    });
                }
            }
        });
        return connectionOptions;
    };
    Object.defineProperty(ConnectionOptionsReader.prototype, "baseFilePath", {
        /**
         * Gets directory where configuration file should be located and configuration file name without extension.
         */
        get: function () {
            return this.baseDirectory + "/" + this.baseConfigName;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ConnectionOptionsReader.prototype, "baseDirectory", {
        /**
         * Gets directory where configuration file should be located.
         */
        get: function () {
            if (this.options && this.options.root)
                return this.options.root;
            return PlatformTools_1.PlatformTools.load("app-root-path").path;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ConnectionOptionsReader.prototype, "baseConfigName", {
        /**
         * Gets configuration file name.
         */
        get: function () {
            if (this.options && this.options.configName)
                return this.options.configName;
            return "ormconfig";
        },
        enumerable: true,
        configurable: true
    });
    return ConnectionOptionsReader;
}());
exports.ConnectionOptionsReader = ConnectionOptionsReader;

//# sourceMappingURL=ConnectionOptionsReader.js.map
