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
 * Thrown when an optimistic lock cannot be used in query builder.
 */
var OptimisticLockCanNotBeUsedError = /** @class */ (function (_super) {
    __extends(OptimisticLockCanNotBeUsedError, _super);
    function OptimisticLockCanNotBeUsedError() {
        var _this = _super.call(this) || this;
        _this.name = "OptimisticLockCanNotBeUsedError";
        Object.setPrototypeOf(_this, OptimisticLockCanNotBeUsedError.prototype);
        _this.message = "The optimistic lock can be used only with getOne() method.";
        return _this;
    }
    return OptimisticLockCanNotBeUsedError;
}(Error));
exports.OptimisticLockCanNotBeUsedError = OptimisticLockCanNotBeUsedError;

//# sourceMappingURL=OptimisticLockCanNotBeUsedError.js.map
