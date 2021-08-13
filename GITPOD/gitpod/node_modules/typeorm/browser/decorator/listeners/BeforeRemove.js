import { getMetadataArgsStorage } from "../../index";
import { EventListenerTypes } from "../../metadata/types/EventListenerTypes";
/**
 * Calls a method on which this decorator is applied before this entity removal.
 */
export function BeforeRemove() {
    return function (object, propertyName) {
        var args = {
            target: object.constructor,
            propertyName: propertyName,
            type: EventListenerTypes.BEFORE_REMOVE
        };
        getMetadataArgsStorage().entityListeners.push(args);
    };
}

//# sourceMappingURL=BeforeRemove.js.map
