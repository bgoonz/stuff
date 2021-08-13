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
 * Thrown when user tries to execute operation that requires connection to be established.
 */
var ConnectionIsNotSetError = /** @class */ (function (_super) {
    __extends(ConnectionIsNotSetError, _super);
    function ConnectionIsNotSetError(dbType) {
        var _this = _super.call(this) || this;
        _this.name = "ConnectionIsNotSetError";
        _this.message = "Connection with " + dbType + " database is not established. Check connection configuration.";
        return _this;
    }
    return ConnectionIsNotSetError;
}(Error));
export { ConnectionIsNotSetError };

//# sourceMappingURL=ConnectionIsNotSetError.js.map
