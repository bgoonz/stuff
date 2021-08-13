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
 * Thrown when a transaction is required for the current operation, but there is none open.
 */
var PessimisticLockTransactionRequiredError = /** @class */ (function (_super) {
    __extends(PessimisticLockTransactionRequiredError, _super);
    function PessimisticLockTransactionRequiredError() {
        var _this = _super.call(this) || this;
        _this.name = "PessimisticLockTransactionRequiredError";
        Object.setPrototypeOf(_this, PessimisticLockTransactionRequiredError.prototype);
        _this.message = "An open transaction is required for pessimistic lock.";
        return _this;
    }
    return PessimisticLockTransactionRequiredError;
}(Error));
export { PessimisticLockTransactionRequiredError };

//# sourceMappingURL=PessimisticLockTransactionRequiredError.js.map
