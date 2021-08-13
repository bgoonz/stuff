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
var AbstractSqliteDriver_1 = require("../sqlite-abstract/AbstractSqliteDriver");
var SqljsQueryRunner_1 = require("./SqljsQueryRunner");
var DriverPackageNotInstalledError_1 = require("../../error/DriverPackageNotInstalledError");
var DriverOptionNotSetError_1 = require("../../error/DriverOptionNotSetError");
var PlatformTools_1 = require("../../platform/PlatformTools");
var SqljsDriver = /** @class */ (function (_super) {
    __extends(SqljsDriver, _super);
    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    function SqljsDriver(connection) {
        var _this = _super.call(this, connection) || this;
        // If autoSave is enabled by user, location or autoSaveCallback have to be set
        // because either autoSave saves to location or calls autoSaveCallback.
        if (_this.options.autoSave && !_this.options.location && !_this.options.autoSaveCallback) {
            throw new DriverOptionNotSetError_1.DriverOptionNotSetError("location or autoSaveCallback");
        }
        // load sql.js package
        _this.loadDependencies();
        return _this;
    }
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    /**
     * Performs connection to the database.
     */
    SqljsDriver.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, this.createDatabaseConnection()];
                    case 1:
                        _a.databaseConnection = _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Closes connection with database.
     */
    SqljsDriver.prototype.disconnect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (ok, fail) {
                        try {
                            _this.queryRunner = undefined;
                            _this.databaseConnection.close();
                            ok();
                        }
                        catch (e) {
                            fail(e);
                        }
                    })];
            });
        });
    };
    /**
     * Creates a query runner used to execute database queries.
     */
    SqljsDriver.prototype.createQueryRunner = function (mode) {
        if (mode === void 0) { mode = "master"; }
        if (!this.queryRunner)
            this.queryRunner = new SqljsQueryRunner_1.SqljsQueryRunner(this);
        return this.queryRunner;
    };
    /**
     * Loads a database from a given file (Node.js), local storage key (browser) or array.
     * This will delete the current database!
     */
    SqljsDriver.prototype.load = function (fileNameOrLocalStorageOrData) {
        if (typeof fileNameOrLocalStorageOrData === "string") {
            // content has to be loaded
            if (PlatformTools_1.PlatformTools.type === "node") {
                // Node.js
                // fileNameOrLocalStorageOrData should be a path to the file
                if (PlatformTools_1.PlatformTools.fileExist(fileNameOrLocalStorageOrData)) {
                    var database = PlatformTools_1.PlatformTools.readFileSync(fileNameOrLocalStorageOrData);
                    return this.createDatabaseConnectionWithImport(database);
                }
                else {
                    throw new Error("File " + fileNameOrLocalStorageOrData + " does not exist");
                }
            }
            else {
                // browser
                // fileNameOrLocalStorageOrData should be a local storage key
                var localStorageContent = PlatformTools_1.PlatformTools.getGlobalVariable().localStorage.getItem(fileNameOrLocalStorageOrData);
                return this.createDatabaseConnectionWithImport(JSON.parse(localStorageContent));
            }
        }
        else {
            return this.createDatabaseConnectionWithImport(fileNameOrLocalStorageOrData);
        }
    };
    /**
     * Saved the current database to the given file (Node.js) or local storage key (browser).
     * If no location path is given, the location path in the options (if specified) will be used.
     */
    SqljsDriver.prototype.save = function (location) {
        return __awaiter(this, void 0, void 0, function () {
            var path, content, e_1, database, databaseArray;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!location && !this.options.location) {
                            throw new Error("No location is set, specify a location parameter or add the location option to your configuration");
                        }
                        path = "";
                        if (location) {
                            path = location;
                        }
                        else if (this.options.location) {
                            path = this.options.location;
                        }
                        if (!(PlatformTools_1.PlatformTools.type === "node")) return [3 /*break*/, 5];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        content = new Buffer(this.databaseConnection.export());
                        return [4 /*yield*/, PlatformTools_1.PlatformTools.writeFile(path, content)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        throw new Error("Could not save database, error: " + e_1);
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        database = this.databaseConnection.export();
                        databaseArray = [].slice.call(database);
                        PlatformTools_1.PlatformTools.getGlobalVariable().localStorage.setItem(path, JSON.stringify(databaseArray));
                        _a.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * This gets called by the QueryRunner when a change to the database is made.
     * If a custom autoSaveCallback is specified, it get's called with the database as Uint8Array,
     * otherwise the save method is called which saves it to file (Node.js) or localstorage (browser).
     */
    SqljsDriver.prototype.autoSave = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.options.autoSave) return [3 /*break*/, 4];
                        if (!this.options.autoSaveCallback) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.options.autoSaveCallback(this.export())];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.save()];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Returns the current database as Uint8Array.
     */
    SqljsDriver.prototype.export = function () {
        return this.databaseConnection.export();
    };
    // -------------------------------------------------------------------------
    // Protected Methods
    // -------------------------------------------------------------------------
    /**
     * Creates connection with the database.
     * If the location option is set, the database is loaded first.
     */
    SqljsDriver.prototype.createDatabaseConnection = function () {
        if (this.options.location) {
            return this.load(this.options.location);
        }
        return this.createDatabaseConnectionWithImport(this.options.database);
    };
    /**
     * Creates connection with an optional database.
     * If database is specified it is loaded, otherwise a new empty database is created.
     */
    SqljsDriver.prototype.createDatabaseConnectionWithImport = function (database) {
        var _this = this;
        if (database && database.length > 0) {
            this.databaseConnection = new this.sqlite.Database(database);
        }
        else {
            this.databaseConnection = new this.sqlite.Database();
        }
        // Enable foreign keys for database
        return new Promise(function (ok, fail) {
            try {
                _this.databaseConnection.exec("PRAGMA foreign_keys = ON;");
                ok(_this.databaseConnection);
            }
            catch (e) {
                fail(e);
            }
        });
    };
    /**
     * If driver dependency is not given explicitly, then try to load it via "require".
     */
    SqljsDriver.prototype.loadDependencies = function () {
        if (PlatformTools_1.PlatformTools.type === "browser") {
            this.sqlite = window.SQL;
        }
        else {
            try {
                this.sqlite = PlatformTools_1.PlatformTools.load("sql.js");
            }
            catch (e) {
                throw new DriverPackageNotInstalledError_1.DriverPackageNotInstalledError("sql.js", "sql.js");
            }
        }
    };
    return SqljsDriver;
}(AbstractSqliteDriver_1.AbstractSqliteDriver));
exports.SqljsDriver = SqljsDriver;

//# sourceMappingURL=SqljsDriver.js.map
