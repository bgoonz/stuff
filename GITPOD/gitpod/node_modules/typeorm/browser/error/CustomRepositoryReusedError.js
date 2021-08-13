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
 * Thrown if same custom repository instance is reused between different connections.
 */
var CustomRepositoryReusedError = /** @class */ (function (_super) {
    __extends(CustomRepositoryReusedError, _super);
    function CustomRepositoryReusedError(repository) {
        var _this = _super.call(this, "Custom entity repository " + (repository instanceof Function ? repository.name : repository.constructor.name) + " " +
            "was already used in the different connection. You can't share entity repositories between different connections " +
            "when useContainer is set to true for the entity repository.") || this;
        _this.name = "CustomRepositoryReusedError";
        return _this;
    }
    return CustomRepositoryReusedError;
}(Error));
export { CustomRepositoryReusedError };

//# sourceMappingURL=CustomRepositoryReusedError.js.map
