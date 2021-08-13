"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../../index");
/**
 * Marks a specific property of the class as a parent of the tree.
 */
function TreeParent(options) {
    return function (object, propertyName) {
        if (!options)
            options = {};
        // now try to determine it its lazy relation
        var isLazy = options && options.lazy === true ? true : false;
        if (!isLazy && Reflect && Reflect.getMetadata) { // automatic determination
            var reflectedType = Reflect.getMetadata("design:type", object, propertyName);
            if (reflectedType && typeof reflectedType.name === "string" && reflectedType.name.toLowerCase() === "promise")
                isLazy = true;
        }
        var args = {
            isTreeParent: true,
            target: object.constructor,
            propertyName: propertyName,
            // propertyType: reflectedType,
            isLazy: isLazy,
            relationType: "many-to-one",
            type: function () { return object.constructor; },
            options: options
        };
        index_1.getMetadataArgsStorage().relations.push(args);
    };
}
exports.TreeParent = TreeParent;

//# sourceMappingURL=TreeParent.js.map
