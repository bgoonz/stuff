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
 * Thrown when a version check on an object that uses optimistic locking through a version field fails.
 */
var OptimisticLockVersionMismatchError = /** @class */ (function (_super) {
    __extends(OptimisticLockVersionMismatchError, _super);
    function OptimisticLockVersionMismatchError(entity, expectedVersion, actualVersion) {
        var _this = _super.call(this) || this;
        _this.name = "OptimisticLockVersionMismatchError";
        Object.setPrototypeOf(_this, OptimisticLockVersionMismatchError.prototype);
        _this.message = "The optimistic lock on entity " + entity + " failed, version " + expectedVersion + " was expected, but is actually " + actualVersion + ".";
        return _this;
    }
    return OptimisticLockVersionMismatchError;
}(Error));
exports.OptimisticLockVersionMismatchError = OptimisticLockVersionMismatchError;

//# sourceMappingURL=OptimisticLockVersionMismatchError.js.map
