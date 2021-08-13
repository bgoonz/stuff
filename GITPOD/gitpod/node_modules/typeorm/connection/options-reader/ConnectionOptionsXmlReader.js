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
var PlatformTools_1 = require("../../platform/PlatformTools");
/**
 * Reads connection options defined in the xml file.
 */
var ConnectionOptionsXmlReader = /** @class */ (function () {
    function ConnectionOptionsXmlReader() {
    }
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    /**
     * Reads connection options from given xml file.
     */
    ConnectionOptionsXmlReader.prototype.read = function (path) {
        return __awaiter(this, void 0, void 0, function () {
            var xml;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.readXml(path)];
                    case 1:
                        xml = _a.sent();
                        return [2 /*return*/, xml.connection.map(function (connection) {
                                return {
                                    name: connection.$.name,
                                    type: connection.$.type,
                                    url: connection.url ? connection.url[0] : undefined,
                                    host: connection.host ? connection.host[0] : undefined,
                                    port: connection.port && connection.port[0] ? parseInt(connection.port[0]) : undefined,
                                    username: connection.username ? connection.username[0] : undefined,
                                    password: connection.password ? connection.password[0] : undefined,
                                    database: connection.database ? connection.database[0] : undefined,
                                    sid: connection.sid ? connection.sid[0] : undefined,
                                    extra: connection.extra ? connection.extra[0] : undefined,
                                    synchronize: connection.synchronize ? connection.synchronize[0] : undefined,
                                    entities: connection.entities ? connection.entities[0].entity : [],
                                    subscribers: connection.subscribers ? connection.subscribers[0].entity : [],
                                    entitySchemas: connection.entitySchemas ? connection.entitySchemas[0].entity : [],
                                    logging: connection.logging[0] ? connection.logging[0].split(",") : undefined,
                                };
                            })];
                }
            });
        });
    };
    // -------------------------------------------------------------------------
    // Protected Methods
    // -------------------------------------------------------------------------
    /**
     * Reads xml file contents and returns them in a promise.
     */
    ConnectionOptionsXmlReader.prototype.readXml = function (path) {
        var xmlParser = PlatformTools_1.PlatformTools.load("xml2js").parseString;
        var xmlOptions = { trim: true, explicitRoot: false };
        return new Promise(function (ok, fail) {
            xmlParser(PlatformTools_1.PlatformTools.readFileSync(path), xmlOptions, function (err, result) { return err ? fail(err) : ok(result); });
        });
    };
    return ConnectionOptionsXmlReader;
}());
exports.ConnectionOptionsXmlReader = ConnectionOptionsXmlReader;

//# sourceMappingURL=ConnectionOptionsXmlReader.js.map
