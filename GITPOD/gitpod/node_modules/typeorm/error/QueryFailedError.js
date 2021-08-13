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
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Thrown when query execution has failed.
*/
var QueryFailedError = /** @class */ (function (_super) {
    __extends(QueryFailedError, _super);
    function QueryFailedError(query, parameters, driverError) {
        var _this = _super.call(this) || this;
        _this.message = driverError.toString()
            .replace(/^error: /, "")
            .replace(/^Error: /, "")
            .replace(/^Request/, "");
        Object.setPrototypeOf(_this, QueryFailedError.prototype);
        Object.assign(_this, __assign({}, driverError, { name: "QueryFailedError", query: query, parameters: parameters || [] }));
        return _this;
    }
    return QueryFailedError;
}(Error));
exports.QueryFailedError = QueryFailedError;

//# sourceMappingURL=QueryFailedError.js.map
