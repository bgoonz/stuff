import { ColumnOptions } from "../options/ColumnOptions";
import { SimpleColumnType, WithLengthColumnType, WithPrecisionColumnType } from "../../driver/types/ColumnTypes";
import { ColumnCommonOptions } from "../options/ColumnCommonOptions";
import { ColumnWithLengthOptions } from "../options/ColumnWithLengthOptions";
import { ColumnNumericOptions } from "../options/ColumnNumericOptions";
import { ColumnEnumOptions } from "../options/ColumnEnumOptions";
import { ColumnEmbeddedOptions } from "../options/ColumnEmbeddedOptions";
/**
 * Column decorator is used to mark a specific class property as a table column. Only properties decorated with this
 * decorator will be persisted to the database when entity be saved.
 */
export declare function Column(): Function;
/**
 * Column decorator is used to mark a specific class property as a table column.
 * Only properties decorated with this decorator will be persisted to the database when entity be saved.
 */
export declare function Column(options: ColumnOptions): Function;
/**
 * Column decorator is used to mark a specific class property as a table column.
 * Only properties decorated with this decorator will be persisted to the database when entity be saved.
 */
export declare function Column(type: SimpleColumnType, options?: ColumnCommonOptions): Function;
/**
 * Column decorator is used to mark a specific class property as a table column.
 * Only properties decorated with this decorator will be persisted to the database when entity be saved.
 */
export declare function Column(type: WithLengthColumnType, options?: ColumnCommonOptions & ColumnWithLengthOptions): Function;
/**
 * Column decorator is used to mark a specific class property as a table column.
 * Only properties decorated with this decorator will be persisted to the database when entity be saved.
 */
export declare function Column(type: WithPrecisionColumnType, options?: ColumnCommonOptions & ColumnNumericOptions): Function;
/**
 * Column decorator is used to mark a specific class property as a table column.
 * Only properties decorated with this decorator will be persisted to the database when entity be saved.
 */
export declare function Column(type: "enum", options?: ColumnCommonOptions & ColumnEnumOptions): Function;
/**
 * Column decorator is used to mark a specific class property as a table column.
 * Only properties decorated with this decorator will be persisted to the database when entity be saved.
 *
 * Property in entity can be marked as Embedded, and on persist all columns from the embedded are mapped to the
 * single table of the entity where Embedded is used. And on hydration all columns which supposed to be in the
 * embedded will be mapped to it from the single table.
 */
export declare function Column(type: (type?: any) => Function, options?: ColumnEmbeddedOptions): Function;
