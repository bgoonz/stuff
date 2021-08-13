"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../../index");
/**
 * Classes decorated with this decorator will listen to ORM events and their methods will be triggered when event
 * occurs. Those classes must implement EventSubscriberInterface interface.
 */
function EventSubscriber() {
    return function (target) {
        var args = {
            target: target
        };
        index_1.getMetadataArgsStorage().entitySubscribers.push(args);
    };
}
exports.EventSubscriber = EventSubscriber;

//# sourceMappingURL=EventSubscriber.js.map
