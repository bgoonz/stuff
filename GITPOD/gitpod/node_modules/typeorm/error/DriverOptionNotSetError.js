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
 * Thrown if some required driver's option is not set.
 */
var DriverOptionNotSetError = /** @class */ (function (_super) {
    __extends(DriverOptionNotSetError, _super);
    function DriverOptionNotSetError(optionName) {
        var _this = _super.call(this) || this;
        _this.name = "DriverOptionNotSetError";
        _this.message = "Driver option (" + optionName + ") is not set. Please set it to perform connection to the database.";
        return _this;
    }
    return DriverOptionNotSetError;
}(Error));
exports.DriverOptionNotSetError = DriverOptionNotSetError;

//# sourceMappingURL=DriverOptionNotSetError.js.map
