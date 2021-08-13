/**
 * Defines a Sort Direction - Refer to {@link AgilityFetch.Types.SortDirections} Enum for available Sort Directions.
 * @typedef {string} SortDirection
 * @memberOf AgilityFetch.Types
 */

/**
 * Enum of SortDirections.
 * @enum {SortDirection} SortDirections
 * @memberOf AgilityFetch.Types
 * @default ASC
 * @readonly
 */
const SortDirections = {
    /** Ascending */
    ASC: "asc",
    /** Descending */
    DESC: "desc",
};

export default SortDirections;