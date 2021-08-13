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
 * Thrown if custom repository was not found.
 */
var CustomRepositoryNotFoundError = /** @class */ (function (_super) {
    __extends(CustomRepositoryNotFoundError, _super);
    function CustomRepositoryNotFoundError(repository) {
        var _this = _super.call(this) || this;
        _this.name = "CustomRepositoryNotFoundError";
        _this.message = "Custom repository " + (repository instanceof Function ? repository.name : repository.constructor.name) + " was not found. " +
            "Did you forgot to put @EntityRepository decorator on it?";
        return _this;
    }
    return CustomRepositoryNotFoundError;
}(Error));
exports.CustomRepositoryNotFoundError = CustomRepositoryNotFoundError;

//# sourceMappingURL=CustomRepositoryNotFoundError.js.map
