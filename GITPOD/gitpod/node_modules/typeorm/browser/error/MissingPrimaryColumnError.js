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
 */
var MissingPrimaryColumnError = /** @class */ (function (_super) {
    __extends(MissingPrimaryColumnError, _super);
    function MissingPrimaryColumnError(entityMetadata) {
        var _this = _super.call(this) || this;
        _this.name = "MissingPrimaryColumnError";
        _this.message = "Entity \"" + entityMetadata.name + "\" does not have a primary column. Primary column is required to " +
            "have in all your entities. Use @PrimaryColumn decorator to add a primary column to your entity.";
        return _this;
    }
    return MissingPrimaryColumnError;
}(Error));
export { MissingPrimaryColumnError };

//# sourceMappingURL=MissingPrimaryColumnError.js.map
