/**
 * Defines a FilterOperator - Refer to {@link AgilityFetch.Types.FilterOperators} Enum for available Operators.
 * @typedef {string} FilterOperator
 * @memberOf AgilityFetch.Types
 */

/**
 * Enum of FilterOperators.
 * @enum {FilterOperator} FilterOperators
 * @memberOf AgilityFetch.Types
 * @readonly
 */
const FilterOperators = {
    /** Equal To */
    EQUAL_TO: "eq",
    /** Not Equal To */
    NOT_EQUAL_TO: "ne",
    /** Less Than */
    LESS_THAN: "lt",
    /** Less Than or Equal To */
    LESS_THAN_OR_EQUAL_TO: "lte",
    /** Greater Than */
    GREATER_THAN: "gt",
    /** Greater Than or Equal To */
    GREATER_THAN_OR_EQUAL_TO: "gte",
    /** Like (string only) */
    LIKE: "like"
};

export default FilterOperators;