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
var MetadataAlreadyExistsError = /** @class */ (function (_super) {
    __extends(MetadataAlreadyExistsError, _super);
    function MetadataAlreadyExistsError(metadataType, constructor, propertyName) {
        var _this = _super.call(this) || this;
        _this.name = "MetadataAlreadyExistsError";
        _this.message = metadataType + " metadata already exists for the class constructor " + JSON.stringify(constructor) +
            (propertyName ? " on property " + propertyName : ". If you previously renamed or moved entity class, make sure" +
                " that compiled version of old entity class source wasn't left in the compiler output directory.");
        return _this;
    }
    return MetadataAlreadyExistsError;
}(Error));
export { MetadataAlreadyExistsError };

//# sourceMappingURL=MetadataAlreadyExistsError.js.map
