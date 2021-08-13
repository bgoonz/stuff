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
 * Thrown when consumer tries to use query runner from query runner provider after it was released.
 */
var QueryRunnerProviderAlreadyReleasedError = /** @class */ (function (_super) {
    __extends(QueryRunnerProviderAlreadyReleasedError, _super);
    function QueryRunnerProviderAlreadyReleasedError() {
        var _this = _super.call(this) || this;
        _this.name = "QueryRunnerProviderAlreadyReleasedError";
        _this.message = "Database connection provided by a query runner was already released, cannot continue to use its querying methods anymore.";
        _this.stack = new Error().stack;
        return _this;
    }
    return QueryRunnerProviderAlreadyReleasedError;
}(Error));
export { QueryRunnerProviderAlreadyReleasedError };

//# sourceMappingURL=QueryRunnerProviderAlreadyReleasedError.js.map
