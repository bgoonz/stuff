import { getMetadataArgsStorage } from "../../index";
/**
 * This column will store an update date of the updated object.
 * This date is being updated each time you persist the object.
 */
export function UpdateDateColumn(options) {
    return function (object, propertyName) {
        var args = {
            target: object.constructor,
            propertyName: propertyName,
            mode: "updateDate",
            options: options ? options : {}
        };
        getMetadataArgsStorage().columns.push(args);
    };
}

//# sourceMappingURL=UpdateDateColumn.js.map
