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
 * Thrown when consumer tries to release entity manager that does not use single database connection.
 */
var NoNeedToReleaseEntityManagerError = /** @class */ (function (_super) {
    __extends(NoNeedToReleaseEntityManagerError, _super);
    function NoNeedToReleaseEntityManagerError() {
        var _this = _super.call(this) || this;
        _this.name = "NoNeedToReleaseEntityManagerError";
        _this.message = "Entity manager is not using single database connection and cannot be released. " +
            "Only entity managers created by connection#createEntityManagerWithSingleDatabaseConnection " +
            "methods have a single database connection and they should be released.";
        _this.stack = new Error().stack;
        return _this;
    }
    return NoNeedToReleaseEntityManagerError;
}(Error));
export { NoNeedToReleaseEntityManagerError };

//# sourceMappingURL=NoNeedToReleaseEntityManagerError.js.map
