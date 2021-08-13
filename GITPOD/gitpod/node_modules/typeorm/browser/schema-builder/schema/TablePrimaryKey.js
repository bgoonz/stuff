/**
 * Primary key from the database stored in this class.
 */
var TablePrimaryKey = /** @class */ (function () {
    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    function TablePrimaryKey(name, columnName) {
        this.name = name;
        this.columnName = columnName;
    }
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    /**
     * Creates a new copy of this primary key with exactly same properties.
     */
    TablePrimaryKey.prototype.clone = function () {
        return new TablePrimaryKey(this.name, this.columnName);
    };
    return TablePrimaryKey;
}());
export { TablePrimaryKey };

//# sourceMappingURL=TablePrimaryKey.js.map
