import { getMetadataArgsStorage } from "../../index";
/**
 * Column decorator is used to mark a specific class property as a table column.
 * Only properties decorated with this decorator will be persisted to the database when entity be saved.
 */
export function Column(typeOrOptions, options) {
    var type;
    if (typeof typeOrOptions === "string" || typeOrOptions instanceof Function) {
        type = typeOrOptions;
    }
    else if (typeOrOptions) {
        options = typeOrOptions;
        type = typeOrOptions.type;
    }
    return function (object, propertyName) {
        if (typeOrOptions instanceof Function) {
            var reflectMetadataType = Reflect && Reflect.getMetadata ? Reflect.getMetadata("design:type", object, propertyName) : undefined;
            var isArray = reflectMetadataType === Array || (options && (options.isArray === true || options.array === true)) ? true : false;
            var args = {
                target: object.constructor,
                propertyName: propertyName,
                isArray: isArray,
                prefix: options && options.prefix !== undefined ? options.prefix : undefined,
                type: typeOrOptions
            };
            getMetadataArgsStorage().embeddeds.push(args);
        }
        else {
            // if type is not given implicitly then try to guess it
            if (!type) {
                var reflectMetadataType = Reflect && Reflect.getMetadata ? Reflect.getMetadata("design:type", object, propertyName) : undefined;
                if (reflectMetadataType)
                    type = reflectMetadataType; // todo: need to determine later on driver level
            }
            // if column options are not given then create a new empty options
            if (!options)
                options = {};
            // check if there is no type in column options then set type from first function argument, or guessed one
            if (!options.type && type)
                options = Object.assign({ type: type }, options);
            // create and register a new column metadata
            var args = {
                target: object.constructor,
                propertyName: propertyName,
                mode: "regular",
                options: options
            };
            getMetadataArgsStorage().columns.push(args);
        }
    };
}

//# sourceMappingURL=Column.js.map
