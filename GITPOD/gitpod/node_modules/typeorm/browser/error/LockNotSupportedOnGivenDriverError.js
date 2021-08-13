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
 * Thrown when selected sql driver does not supports locking.
 */
var LockNotSupportedOnGivenDriverError = /** @class */ (function (_super) {
    __extends(LockNotSupportedOnGivenDriverError, _super);
    function LockNotSupportedOnGivenDriverError() {
        var _this = _super.call(this) || this;
        _this.name = "LockNotSupportedOnGivenDriverError";
        Object.setPrototypeOf(_this, LockNotSupportedOnGivenDriverError.prototype);
        _this.message = "Locking not supported on given driver.";
        return _this;
    }
    return LockNotSupportedOnGivenDriverError;
}(Error));
export { LockNotSupportedOnGivenDriverError };

//# sourceMappingURL=LockNotSupportedOnGivenDriverError.js.map
