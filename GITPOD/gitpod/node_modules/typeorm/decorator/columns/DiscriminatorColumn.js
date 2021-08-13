"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../../index");
/**
 * DiscriminatorColumn is a special type column used on entity class (not entity property)
 * and creates a special column which will contain an entity type.
 * This type is required for entities which use single table inheritance pattern.
 */
function DiscriminatorColumn(discriminatorOptions) {
    return function (target) {
        // if column options are not given then create a new empty options
        var options = {
            name: discriminatorOptions.name,
            type: discriminatorOptions.type
        };
        // create and register a new column metadata
        var args = {
            target: target,
            mode: "discriminator",
            propertyName: discriminatorOptions.name,
            options: options
        };
        index_1.getMetadataArgsStorage().columns.push(args);
    };
}
exports.DiscriminatorColumn = DiscriminatorColumn;

//# sourceMappingURL=DiscriminatorColumn.js.map
