import { ObjectType } from "../../common/ObjectType";
/**
 * One-to-many relation allows to create type of relation when Entity2 can have multiple instances of Entity1.
 * Entity1 have only one Entity2. Entity1 is an owner of the relationship, and storages Entity2 id on its own side.
 */
export declare function OneToMany<T>(typeFunction: (type?: any) => ObjectType<T>, inverseSide: string | ((object: T) => any), options?: {
    cascadeInsert?: boolean;
    cascadeUpdate?: boolean;
    lazy?: boolean;
    eager?: boolean;
}): Function;
