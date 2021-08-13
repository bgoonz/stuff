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
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Thrown when user tries to build SELECT query using OFFSET without LIMIT applied but database does not support it.
*/
var OffsetWithoutLimitNotSupportedError = /** @class */ (function (_super) {
    __extends(OffsetWithoutLimitNotSupportedError, _super);
    function OffsetWithoutLimitNotSupportedError(driverName) {
        var _this = _super.call(this, driverName + " does not support OFFSET without LIMIT in SELECT statements. You must use limit in conjunction with offset function (or take in conjunction with skip function if you are using pagination).") || this;
        Object.setPrototypeOf(_this, OffsetWithoutLimitNotSupportedError.prototype);
        _this.name = "OffsetWithoutLimitNotSupportedError";
        return _this;
    }
    return OffsetWithoutLimitNotSupportedError;
}(Error));
exports.OffsetWithoutLimitNotSupportedError = OffsetWithoutLimitNotSupportedError;

//# sourceMappingURL=OffsetWithoutLimitNotSupportedError.js.map
