import { getMetadataArgsStorage } from "../../index";
/**
 * Marks a specific property of the class as a children of the tree.
 */
export function TreeChildren(options) {
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
        // add one-to-many relation for this 
        var args = {
            isTreeChildren: true,
            target: object.constructor,
            propertyName: propertyName,
            // propertyType: reflectedType,
            isLazy: isLazy,
            relationType: "one-to-many",
            type: function () { return object.constructor; },
            options: options
        };
        getMetadataArgsStorage().relations.push(args);
    };
}

//# sourceMappingURL=TreeChildren.js.map
