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
 * Thrown when consumer tries to get connection that does not exist.
 */
var ConnectionNotFoundError = /** @class */ (function (_super) {
    __extends(ConnectionNotFoundError, _super);
    function ConnectionNotFoundError(name) {
        var _this = _super.call(this) || this;
        _this.name = "ConnectionNotFoundError";
        _this.message = "Connection \"" + name + "\" was not found.";
        _this.stack = new Error().stack;
        return _this;
    }
    return ConnectionNotFoundError;
}(Error));
export { ConnectionNotFoundError };

//# sourceMappingURL=ConnectionNotFoundError.js.map
