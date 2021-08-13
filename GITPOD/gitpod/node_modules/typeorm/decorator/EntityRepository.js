"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../index");
/**
 * Used to declare a class as a custom repository.
 * Custom repository can either manage some specific entity, either just be generic.
 * Custom repository can extend AbstractRepository or regular Repository or TreeRepository.
 */
function EntityRepository(entity) {
    return function (target) {
        var args = {
            target: target,
            entity: entity,
        };
        index_1.getMetadataArgsStorage().entityRepositories.push(args);
    };
}
exports.EntityRepository = EntityRepository;

//# sourceMappingURL=EntityRepository.js.map
