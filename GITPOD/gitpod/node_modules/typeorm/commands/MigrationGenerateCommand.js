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
var ConnectionOptionsReader_1 = require("../connection/ConnectionOptionsReader");
var CommandUtils_1 = require("./CommandUtils");
var index_1 = require("../index");
var MysqlDriver_1 = require("../driver/mysql/MysqlDriver");
var chalk = require("chalk");
/**
 * Generates a new migration file with sql needs to be executed to update schema.
 */
var MigrationGenerateCommand = /** @class */ (function () {
    function MigrationGenerateCommand() {
        this.command = "migrations:generate";
        this.describe = "Generates a new migration file with sql needs to be executed to update schema.";
    }
    MigrationGenerateCommand.prototype.builder = function (yargs) {
        return yargs
            .option("c", {
            alias: "connection",
            default: "default",
            describe: "Name of the connection on which run a query."
        })
            .option("n", {
            alias: "name",
            describe: "Name of the migration class.",
            demand: true
        })
            .option("d", {
            alias: "dir",
            describe: "Directory where migration should be created."
        })
            .option("f", {
            alias: "config",
            default: "ormconfig",
            describe: "Name of the file with connection configuration."
        });
    };
    MigrationGenerateCommand.prototype.handler = function (argv) {
        return __awaiter(this, void 0, void 0, function () {
            var timestamp, filename, directory, connectionOptionsReader, connectionOptions, err_1, connection, connectionOptionsReader, connectionOptions, sqlQueries, upSqls_1, downSqls_1, fileContent, path, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        timestamp = new Date().getTime();
                        filename = timestamp + "-" + argv.name + ".ts";
                        directory = argv.dir;
                        if (!!directory) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        connectionOptionsReader = new ConnectionOptionsReader_1.ConnectionOptionsReader({ root: process.cwd(), configName: argv.config });
                        return [4 /*yield*/, connectionOptionsReader.get(argv.connection)];
                    case 2:
                        connectionOptions = _a.sent();
                        directory = connectionOptions.cli ? connectionOptions.cli.migrationsDir : undefined;
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _a.sent();
                        return [3 /*break*/, 4];
                    case 4:
                        connection = undefined;
                        _a.label = 5;
                    case 5:
                        _a.trys.push([5, 13, , 16]);
                        connectionOptionsReader = new ConnectionOptionsReader_1.ConnectionOptionsReader({ root: process.cwd(), configName: argv.config });
                        return [4 /*yield*/, connectionOptionsReader.get(argv.connection)];
                    case 6:
                        connectionOptions = _a.sent();
                        Object.assign(connectionOptions, {
                            synchronize: false,
                            migrationsRun: false,
                            dropSchema: false,
                            logging: false
                        });
                        return [4 /*yield*/, index_1.createConnection(connectionOptions)];
                    case 7:
                        connection = _a.sent();
                        return [4 /*yield*/, connection.driver.createSchemaBuilder().log()];
                    case 8:
                        sqlQueries = _a.sent();
                        upSqls_1 = [], downSqls_1 = [];
                        // mysql is exceptional here because it uses ` character in to escape names in queries, that's why for mysql
                        // we are using simple quoted string instead of template string syntax
                        if (connection.driver instanceof MysqlDriver_1.MysqlDriver) {
                            sqlQueries.forEach(function (query) {
                                var queryString = typeof query === "string" ? query : query.up;
                                upSqls_1.push("        await queryRunner.query(\"" + queryString.replace(new RegExp("\"", "g"), "\\\"") + "\");");
                                if (typeof query !== "string" && query.down)
                                    downSqls_1.push("        await queryRunner.query(\"" + query.down.replace(new RegExp("\"", "g"), "\\\"") + "\");");
                            });
                        }
                        else {
                            sqlQueries.forEach(function (query) {
                                var queryString = typeof query === "string" ? query : query.up;
                                upSqls_1.push("        await queryRunner.query(`" + queryString.replace(new RegExp("`", "g"), "\\`") + "`);");
                                if (typeof query !== "string" && query.down)
                                    downSqls_1.push("        await queryRunner.query(`" + query.down.replace(new RegExp("`", "g"), "\\`") + "`);");
                            });
                        }
                        if (!upSqls_1.length) return [3 /*break*/, 10];
                        fileContent = MigrationGenerateCommand.getTemplate(argv.name, timestamp, upSqls_1, downSqls_1.reverse());
                        path = process.cwd() + "/" + (directory ? (directory + "/") : "") + filename;
                        return [4 /*yield*/, CommandUtils_1.CommandUtils.createFile(path, fileContent)];
                    case 9:
                        _a.sent();
                        console.log(chalk.green("Migration " + chalk.blue(path) + " has been generated successfully."));
                        return [3 /*break*/, 11];
                    case 10:
                        console.log(chalk.yellow("No changes in database schema were found - cannot generate a migration. To create a new empty migration use \"typeorm migrations:create\" command"));
                        _a.label = 11;
                    case 11: return [4 /*yield*/, connection.close()];
                    case 12:
                        _a.sent();
                        return [3 /*break*/, 16];
                    case 13:
                        err_2 = _a.sent();
                        if (!connection) return [3 /*break*/, 15];
                        return [4 /*yield*/, connection.close()];
                    case 14:
                        _a.sent();
                        _a.label = 15;
                    case 15:
                        console.log(chalk.black.bgRed("Error during migration generation:"));
                        console.error(err_2);
                        process.exit(1);
                        return [3 /*break*/, 16];
                    case 16: return [2 /*return*/];
                }
            });
        });
    };
    // -------------------------------------------------------------------------
    // Protected Static Methods
    // -------------------------------------------------------------------------
    /**
     * Gets contents of the migration file.
     */
    MigrationGenerateCommand.getTemplate = function (name, timestamp, upSqls, downSqls) {
        return "import {MigrationInterface, QueryRunner} from \"typeorm\";\n\nexport class " + name + timestamp + " implements MigrationInterface {\n\n    public async up(queryRunner: QueryRunner): Promise<any> {\n" + upSqls.join("\n") + "\n    }\n\n    public async down(queryRunner: QueryRunner): Promise<any> {\n" + downSqls.join("\n") + "\n    }\n\n}\n";
    };
    return MigrationGenerateCommand;
}());
exports.MigrationGenerateCommand = MigrationGenerateCommand;

//# sourceMappingURL=MigrationGenerateCommand.js.map
