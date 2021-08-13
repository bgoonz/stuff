import { EntityOptions } from "../options/EntityOptions";
/**
 * Used on a entities that stores its children in a tree using closure design pattern.
 */
export declare function ClosureEntity(name?: string, options?: EntityOptions): (target: Function) => void;
