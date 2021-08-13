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
 * Thrown when required driver's package is not installed.
 */
var DriverPackageNotInstalledError = /** @class */ (function (_super) {
    __extends(DriverPackageNotInstalledError, _super);
    function DriverPackageNotInstalledError(driverName, packageName) {
        var _this = _super.call(this) || this;
        _this.name = "DriverPackageNotInstalledError";
        _this.message = driverName + " package has not been found installed. Try to install it: npm install " + packageName + " --save";
        return _this;
    }
    return DriverPackageNotInstalledError;
}(Error));
export { DriverPackageNotInstalledError };

//# sourceMappingURL=DriverPackageNotInstalledError.js.map
