import { getMetadataArgsStorage } from "../../index";
import { EventListenerTypes } from "../../metadata/types/EventListenerTypes";
/**
 * Calls a method on which this decorator is applied after this entity update.
 */
export function AfterUpdate() {
    return function (object, propertyName) {
        var args = {
            target: object.constructor,
            propertyName: propertyName,
            type: EventListenerTypes.AFTER_UPDATE
        };
        getMetadataArgsStorage().entityListeners.push(args);
    };
}

//# sourceMappingURL=AfterUpdate.js.map
