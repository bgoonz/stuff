import { getMetadataArgsStorage } from "../../index";
import { EventListenerTypes } from "../../metadata/types/EventListenerTypes";
/**
 * Calls a method on which this decorator is applied before this entity update.
 */
export function BeforeUpdate() {
    return function (object, propertyName) {
        var args = {
            target: object.constructor,
            propertyName: propertyName,
            type: EventListenerTypes.BEFORE_UPDATE
        };
        getMetadataArgsStorage().entityListeners.push(args);
    };
}

//# sourceMappingURL=BeforeUpdate.js.map
