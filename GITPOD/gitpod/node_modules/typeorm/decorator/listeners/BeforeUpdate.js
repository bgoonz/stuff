"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../../index");
var EventListenerTypes_1 = require("../../metadata/types/EventListenerTypes");
/**
 * Calls a method on which this decorator is applied before this entity update.
 */
function BeforeUpdate() {
    return function (object, propertyName) {
        var args = {
            target: object.constructor,
            propertyName: propertyName,
            type: EventListenerTypes_1.EventListenerTypes.BEFORE_UPDATE
        };
        index_1.getMetadataArgsStorage().entityListeners.push(args);
    };
}
exports.BeforeUpdate = BeforeUpdate;

//# sourceMappingURL=BeforeUpdate.js.map
