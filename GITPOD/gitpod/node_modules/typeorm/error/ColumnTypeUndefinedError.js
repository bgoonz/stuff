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
var ColumnTypeUndefinedError = /** @class */ (function (_super) {
    __extends(ColumnTypeUndefinedError, _super);
    function ColumnTypeUndefinedError(object, propertyName) {
        var _this = _super.call(this) || this;
        _this.name = "ColumnTypeUndefinedError";
        _this.message = "Column type for " + object.constructor.name + "#" + propertyName + " is not defined or cannot be guessed. " +
            "Try to explicitly provide a column type to the @Column decorator.";
        return _this;
    }
    return ColumnTypeUndefinedError;
}(Error));
exports.ColumnTypeUndefinedError = ColumnTypeUndefinedError;

//# sourceMappingURL=ColumnTypeUndefinedError.js.map
