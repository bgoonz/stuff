"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../../index");
// todo: make decorators which use inverse side string separate
/**
 * One-to-many relation allows to create type of relation when Entity2 can have multiple instances of Entity1.
 * Entity1 have only one Entity2. Entity1 is an owner of the relationship, and storages Entity2 id on its own side.
 */
function OneToMany(typeFunction, inverseSide, options) {
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
            target: object.constructor,
            propertyName: propertyName,
            // propertyType: reflectedType,
            isLazy: isLazy,
            relationType: "one-to-many",
            type: typeFunction,
            inverseSideProperty: inverseSide,
            options: options
        };
        index_1.getMetadataArgsStorage().relations.push(args);
    };
}
exports.OneToMany = OneToMany;

//# sourceMappingURL=OneToMany.js.map
