"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../index");
/**
 * If entity is a child table of some table, it should have a discriminator value.
 * This decorator sets custom discriminator value for the entity.
 */
function DiscriminatorValue(value) {
    return function (target) {
        var args = {
            target: target,
            value: value
        };
        index_1.getMetadataArgsStorage().discriminatorValues.push(args);
    };
}
exports.DiscriminatorValue = DiscriminatorValue;

//# sourceMappingURL=DiscriminatorValue.js.map
