import { getMetadataArgsStorage } from "../../index";
/**
 * Special type of column that is available only for MongoDB database.
 * Marks your entity's column to be an object id.
 */
export function ObjectIdColumn(options) {
    return function (object, propertyName) {
        // if column options are not given then create a new empty options
        if (!options)
            options = {};
        options = Object.assign(options, {
            primary: true,
            name: options.name ? options.name : "_id"
        });
        // create and register a new column metadata
        var args = {
            target: object.constructor,
            propertyName: propertyName,
            mode: "objectId",
            options: options
        };
        getMetadataArgsStorage().columns.push(args);
    };
}

//# sourceMappingURL=ObjectIdColumn.js.map
