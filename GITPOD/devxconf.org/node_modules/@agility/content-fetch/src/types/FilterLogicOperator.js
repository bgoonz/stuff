/**
 * Defines a FilterLogicOperator - Refer to {@link AgilityFetch.Types.FilterLogicOperators} Enum for available Logic Operators.
 * @typedef {string} FilterLogicOperator
 * @memberOf AgilityFetch.Types
 */

/**
 * Enum of FilterLogicOperators.
 * @enum {FilterLogicOperator} FilterLogicOperators
 * @memberOf AgilityFetch.Types
 * @default AND
 * @readonly
 */
const FilterLogicOperators = {
    /** And */
    AND: "and",
    /** Or */
    OR: "or"
};

export default FilterLogicOperators;