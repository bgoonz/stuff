import { ObjectType } from "../../common/ObjectType";
/**
 * Many-to-many is a type of relationship when Entity1 can have multiple instances of Entity2, and Entity2 can have
 * multiple instances of Entity1. To achieve it, this type of relation creates a junction table, where it storage
 * entity1 and entity2 ids. This is owner side of the relationship.
 */
export declare function ManyToMany<T>(typeFunction: (type?: any) => ObjectType<T>, options?: {
    cascadeInsert?: boolean;
    cascadeUpdate?: boolean;
    lazy?: boolean;
    eager?: boolean;
}): Function;
/**
 * Many-to-many is a type of relationship when Entity1 can have multiple instances of Entity2, and Entity2 can have
 * multiple instances of Entity1. To achieve it, this type of relation creates a junction table, where it storage
 * entity1 and entity2 ids. This is owner side of the relationship.
 */
export declare function ManyToMany<T>(typeFunction: (type?: any) => ObjectType<T>, inverseSide?: string | ((object: T) => any), options?: {
    cascadeInsert?: boolean;
    cascadeUpdate?: boolean;
    lazy?: boolean;
    eager?: boolean;
}): Function;
