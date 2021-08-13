import { getMetadataArgsStorage } from "../../index";
import { EventListenerTypes } from "../../metadata/types/EventListenerTypes";
/**
 * Calls a method on which this decorator is applied after this entity insertion.
 */
export function AfterInsert() {
    return function (object, propertyName) {
        var args = {
            target: object.constructor,
            propertyName: propertyName,
            type: EventListenerTypes.AFTER_INSERT
        };
        getMetadataArgsStorage().entityListeners.push(args);
    };
}

//# sourceMappingURL=AfterInsert.js.map
