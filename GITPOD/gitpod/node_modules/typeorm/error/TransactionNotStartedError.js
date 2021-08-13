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
 * Thrown when transaction is not started yet and user tries to run commit or rollback.
 */
var TransactionNotStartedError = /** @class */ (function (_super) {
    __extends(TransactionNotStartedError, _super);
    function TransactionNotStartedError() {
        var _this = _super.call(this) || this;
        _this.name = "TransactionNotStartedError";
        _this.message = "Transaction is not started yet, start transaction before committing or rolling it back.";
        return _this;
    }
    return TransactionNotStartedError;
}(Error));
exports.TransactionNotStartedError = TransactionNotStartedError;

//# sourceMappingURL=TransactionNotStartedError.js.map
