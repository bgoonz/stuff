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
 */
var QueryRunnerAlreadyReleasedError = /** @class */ (function (_super) {
    __extends(QueryRunnerAlreadyReleasedError, _super);
    function QueryRunnerAlreadyReleasedError() {
        var _this = _super.call(this) || this;
        _this.name = "QueryRunnerAlreadyReleasedError";
        _this.message = "Query runner already released. Cannot run queries anymore.";
        return _this;
    }
    return QueryRunnerAlreadyReleasedError;
}(Error));
exports.QueryRunnerAlreadyReleasedError = QueryRunnerAlreadyReleasedError;

//# sourceMappingURL=QueryRunnerAlreadyReleasedError.js.map
