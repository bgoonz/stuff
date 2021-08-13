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
var path = require("path");
var fs = require("fs");
var cli_highlight_1 = require("cli-highlight");
var fs_1 = require("fs");
exports.ReadStream = fs_1.ReadStream;
var events_1 = require("events");
exports.EventEmitter = events_1.EventEmitter;
var stream_1 = require("stream");
exports.Readable = stream_1.Readable;
exports.Writable = stream_1.Writable;
var chalk = require("chalk");
/**
 * Platform-specific tools.
 */
var PlatformTools = /** @class */ (function () {
    function PlatformTools() {
    }
    /**
     * Gets global variable where global stuff can be stored.
     */
    PlatformTools.getGlobalVariable = function () {
        return global;
    };
    /**
     * Loads ("require"-s) given file or package.
     * This operation only supports on node platform
     */
    PlatformTools.load = function (name) {
        // if name is not absolute or relative, then try to load package from the node_modules of the directory we are currently in
        // this is useful when we are using typeorm package globally installed and it accesses drivers
        // that are not installed globally
        try {
            // switch case to explicit require statements for webpack compatibility.
            switch (name) {
                /**
                * mongodb
                */
                case "mongodb":
                    return require("mongodb");
                /**
                * mysql
                */
                case "mysql":
                    return require("mysql");
                case "mysql2":
                    return require("mysql2");
                /**
                * oracle
                */
                case "oracledb":
                    return require("oracledb");
                /**
                * postgres
                */
                case "pg":
                    return require("pg");
                case "pg-native":
                    return require("pg-native");
                case "pg-query-stream":
                    return require("pg-query-stream");
                /**
                * redis
                */
                case "redis":
                    return require("redis");
                /**
                * sqlite
                */
                case "sqlite3":
                    return require("sqlite3");
                /**
                * sqlserver
                */
                case "mssql":
                    return require("mssql");
                /**
                * other modules
                */
                case "mkdirp":
                    return require("mkdirp");
                case "path":
                    return require("path");
                case "debug":
                    return require("debug");
                /**
                * default
                */
                default:
                    return require(name);
            }
        }
        catch (err) {
            if (!path.isAbsolute(name) && name.substr(0, 2) !== "./" && name.substr(0, 3) !== "../") {
                return require(path.resolve(process.cwd() + "/node_modules/" + name));
            }
            throw err;
        }
    };
    /**
     * Normalizes given path. Does "path.normalize".
     */
    PlatformTools.pathNormalize = function (pathStr) {
        return path.normalize(pathStr);
    };
    /**
     * Gets file extension. Does "path.extname".
     */
    PlatformTools.pathExtname = function (pathStr) {
        return path.extname(pathStr);
    };
    /**
     * Resolved given path. Does "path.resolve".
     */
    PlatformTools.pathResolve = function (pathStr) {
        return path.resolve(pathStr);
    };
    /**
     * Synchronously checks if file exist. Does "fs.existsSync".
     */
    PlatformTools.fileExist = function (pathStr) {
        return fs.existsSync(pathStr);
    };
    PlatformTools.readFileSync = function (filename) {
        return fs.readFileSync(filename);
    };
    PlatformTools.appendFileSync = function (filename, data) {
        fs.appendFileSync(filename, data);
    };
    PlatformTools.writeFile = function (path, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (ok, fail) {
                        fs.writeFile(path, data, function (err) {
                            if (err)
                                fail(err);
                            ok();
                        });
                    })];
            });
        });
    };
    /**
     * Gets environment variable.
     */
    PlatformTools.getEnvVariable = function (name) {
        return process.env[name];
    };
    /**
     * Highlights sql string to be print in the console.
     */
    PlatformTools.highlightSql = function (sql) {
        var theme = {
            "keyword": chalk.blueBright,
            "literal": chalk.blueBright,
            "string": chalk.white,
            "type": chalk.magentaBright,
            "built_in": chalk.magentaBright,
            "comment": chalk.gray,
        };
        return cli_highlight_1.highlight(sql, { theme: theme, language: "sql" });
    };
    /**
     * Highlights json string to be print in the console.
     */
    PlatformTools.highlightJson = function (json) {
        return cli_highlight_1.highlight(json, { language: "json" });
    };
    /**
     * Logging functions needed by AdvancedConsoleLogger
     */
    PlatformTools.logInfo = function (prefix, info) {
        console.log(chalk.gray.underline(prefix) + " ", info);
    };
    PlatformTools.logError = function (prefix, error) {
        console.log(chalk.underline.red(prefix) + " ", error);
    };
    PlatformTools.logWarn = function (prefix, warning) {
        console.log(chalk.underline.yellow(prefix) + " ", warning);
    };
    PlatformTools.log = function (message) {
        console.log(chalk.underline(message));
    };
    PlatformTools.warn = function (message) {
        return chalk.yellow(message);
    };
    /**
     * Type of the currently running platform.
     */
    PlatformTools.type = "node";
    return PlatformTools;
}());
exports.PlatformTools = PlatformTools;

//# sourceMappingURL=PlatformTools.js.map
