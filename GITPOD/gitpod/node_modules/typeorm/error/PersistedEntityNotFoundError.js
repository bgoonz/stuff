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
 * Thrown . Theoretically can't be thrown.
 */
var PersistedEntityNotFoundError = /** @class */ (function (_super) {
    __extends(PersistedEntityNotFoundError, _super);
    function PersistedEntityNotFoundError() {
        var _this = _super.call(this) || this;
        _this.name = "PersistedEntityNotFoundError";
        _this.message = "Internal error. Persisted entity was not found in the list of prepared operated entities.";
        return _this;
    }
    return PersistedEntityNotFoundError;
}(Error));
exports.PersistedEntityNotFoundError = PersistedEntityNotFoundError;

//# sourceMappingURL=PersistedEntityNotFoundError.js.map
