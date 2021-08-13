import { getMetadataArgsStorage } from "../index";
/**
 * Used to declare a class as a custom repository.
 * Custom repository can either manage some specific entity, either just be generic.
 * Custom repository can extend AbstractRepository or regular Repository or TreeRepository.
 */
export function EntityRepository(entity) {
    return function (target) {
        var args = {
            target: target,
            entity: entity,
        };
        getMetadataArgsStorage().entityRepositories.push(args);
    };
}

//# sourceMappingURL=EntityRepository.js.map
