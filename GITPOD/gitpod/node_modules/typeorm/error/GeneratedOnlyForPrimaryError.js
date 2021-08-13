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
var GeneratedOnlyForPrimaryError = /** @class */ (function (_super) {
    __extends(GeneratedOnlyForPrimaryError, _super);
    function GeneratedOnlyForPrimaryError(object, propertyName) {
        var _this = _super.call(this) || this;
        _this.name = "GeneratedOnlyForPrimaryError";
        _this.message = "Column for property " + object.constructor.name + "#" + propertyName + " cannot have a generated " +
            "value. Generated values supports only in PrimaryColumn decorator or UUID column type.";
        return _this;
    }
    return GeneratedOnlyForPrimaryError;
}(Error));
exports.GeneratedOnlyForPrimaryError = GeneratedOnlyForPrimaryError;

//# sourceMappingURL=GeneratedOnlyForPrimaryError.js.map
