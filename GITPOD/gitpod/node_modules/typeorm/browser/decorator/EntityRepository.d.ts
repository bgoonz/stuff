/**
 * Used to declare a class as a custom repository.
 * Custom repository can either manage some specific entity, either just be generic.
 * Custom repository can extend AbstractRepository or regular Repository or TreeRepository.
 */
export declare function EntityRepository(entity?: Function): Function;
