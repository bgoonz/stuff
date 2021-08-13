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
/**
 * Thrown when user tries to build an UPDATE query with LIMIT but the database does not support it.
*/
var LimitOnUpdateNotSupportedError = /** @class */ (function (_super) {
    __extends(LimitOnUpdateNotSupportedError, _super);
    function LimitOnUpdateNotSupportedError() {
        var _this = _super.call(this, "Your database does not support LIMIT on UPDATE statements.") || this;
        Object.setPrototypeOf(_this, LimitOnUpdateNotSupportedError.prototype);
        _this.name = "LimitOnUpdateNotSupportedError";
        return _this;
    }
    return LimitOnUpdateNotSupportedError;
}(Error));
export { LimitOnUpdateNotSupportedError };

//# sourceMappingURL=LimitOnUpdateNotSupportedError.js.map
