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
 * Thrown when an entity does not have no version and no update date column.
 */
var NoVersionOrUpdateDateColumnError = /** @class */ (function (_super) {
    __extends(NoVersionOrUpdateDateColumnError, _super);
    function NoVersionOrUpdateDateColumnError(entity) {
        var _this = _super.call(this) || this;
        _this.name = "NoVersionOrUpdateDateColumnError";
        Object.setPrototypeOf(_this, NoVersionOrUpdateDateColumnError.prototype);
        _this.message = "Entity " + entity + " does not have version or update date columns.";
        return _this;
    }
    return NoVersionOrUpdateDateColumnError;
}(Error));
exports.NoVersionOrUpdateDateColumnError = NoVersionOrUpdateDateColumnError;

//# sourceMappingURL=NoVersionOrUpdateDateColumnError.js.map
