import { getMetadataArgsStorage } from "../../index";
import { EventListenerTypes } from "../../metadata/types/EventListenerTypes";
/**
 * Calls a method on which this decorator is applied after this entity removal.
 */
export function AfterRemove() {
    return function (object, propertyName) {
        var args = {
            target: object.constructor,
            propertyName: propertyName,
            type: EventListenerTypes.AFTER_REMOVE
        };
        getMetadataArgsStorage().entityListeners.push(args);
    };
}

//# sourceMappingURL=AfterRemove.js.map
