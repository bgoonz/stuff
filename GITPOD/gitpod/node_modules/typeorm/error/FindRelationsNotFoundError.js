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
 * Thrown when relations specified in the find options were not found in the entities.
*/
var FindRelationsNotFoundError = /** @class */ (function (_super) {
    __extends(FindRelationsNotFoundError, _super);
    function FindRelationsNotFoundError(notFoundRelations) {
        var _this = _super.call(this) || this;
        if (notFoundRelations.length === 1) {
            _this.message = "Relation \"" + notFoundRelations[0] + "\" was not found, please check if it is correct and really exist in your entity.";
        }
        else {
            _this.message = "Relations " + notFoundRelations.map(function (relation) { return "\"" + relation + "\""; }).join(", ") + " were not found, please check if relations are correct and they exist in your entities.";
        }
        Object.setPrototypeOf(_this, FindRelationsNotFoundError.prototype);
        return _this;
    }
    return FindRelationsNotFoundError;
}(Error));
exports.FindRelationsNotFoundError = FindRelationsNotFoundError;

//# sourceMappingURL=FindRelationsNotFoundError.js.map
