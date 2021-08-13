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
var index_1 = require("../index");
var ConnectionOptionsReader_1 = require("../connection/ConnectionOptionsReader");
var chalk = require("chalk");
/**
 * Clear cache command.
 */
var CacheClearCommand = /** @class */ (function () {
    function CacheClearCommand() {
        this.command = "cache:clear";
        this.describe = "Clears all data stored in query runner cache.";
    }
    CacheClearCommand.prototype.builder = function (yargs) {
        return yargs
            .option("connection", {
            alias: "c",
            default: "default",
            describe: "Name of the connection on which run a query."
        })
            .option("config", {
            alias: "f",
            default: "ormconfig",
            describe: "Name of the file with connection configuration."
        });
    };
    CacheClearCommand.prototype.handler = function (argv) {
        return __awaiter(this, void 0, void 0, function () {
            var connection, connectionOptionsReader, connectionOptions, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        connection = undefined;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 7, , 10]);
                        connectionOptionsReader = new ConnectionOptionsReader_1.ConnectionOptionsReader({ root: process.cwd(), configName: argv.config });
                        return [4 /*yield*/, connectionOptionsReader.get(argv.connection)];
                    case 2:
                        connectionOptions = _a.sent();
                        Object.assign(connectionOptions, {
                            subscribers: [],
                            synchronize: false,
                            migrationsRun: false,
                            dropSchema: false,
                            logging: ["schema"]
                        });
                        return [4 /*yield*/, index_1.createConnection(connectionOptions)];
                    case 3:
                        connection = _a.sent();
                        if (!connection.queryResultCache)
                            return [2 /*return*/, console.log(chalk.black.bgRed("Cache is not enabled. To use cache enable it in connection configuration."))];
                        return [4 /*yield*/, connection.queryResultCache.clear()];
                    case 4:
                        _a.sent();
                        console.log(chalk.green("Cache was successfully cleared"));
                        if (!connection) return [3 /*break*/, 6];
                        return [4 /*yield*/, connection.close()];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6: return [3 /*break*/, 10];
                    case 7:
                        err_1 = _a.sent();
                        if (!connection) return [3 /*break*/, 9];
                        return [4 /*yield*/, connection.close()];
                    case 8:
                        _a.sent();
                        _a.label = 9;
                    case 9:
                        console.log(chalk.black.bgRed("Error during cache clear:"));
                        console.error(err_1);
                        process.exit(1);
                        return [3 /*break*/, 10];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    return CacheClearCommand;
}());
exports.CacheClearCommand = CacheClearCommand;

//# sourceMappingURL=CacheClearCommand.js.map
