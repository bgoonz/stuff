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
 * Thrown if custom repository inherits Repository class however entity is not set in @EntityRepository decorator.
 */
var CustomRepositoryCannotInheritRepositoryError = /** @class */ (function (_super) {
    __extends(CustomRepositoryCannotInheritRepositoryError, _super);
    function CustomRepositoryCannotInheritRepositoryError(repository) {
        var _this = _super.call(this, "Custom entity repository " + (repository instanceof Function ? repository.name : repository.constructor.name) + " " +
            " cannot inherit Repository class without entity being set in the @EntityRepository decorator.") || this;
        _this.name = "CustomRepositoryCannotInheritRepositoryError";
        return _this;
    }
    return CustomRepositoryCannotInheritRepositoryError;
}(Error));
export { CustomRepositoryCannotInheritRepositoryError };

//# sourceMappingURL=CustomRepositoryCannotInheritRepositoryError.js.map
