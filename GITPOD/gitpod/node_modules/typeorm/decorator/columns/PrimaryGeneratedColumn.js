"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../../index");
/**
 * Column decorator is used to mark a specific class property as a table column.
 * Only properties decorated with this decorator will be persisted to the database when entity be saved.
 * This column creates an integer PRIMARY COLUMN with generated set to true.
 */
function PrimaryGeneratedColumn(strategyOrOptions, maybeOptions) {
    var options = {};
    var strategy;
    if (strategyOrOptions) {
        if (typeof strategyOrOptions === "string")
            strategy = strategyOrOptions;
        if (strategyOrOptions instanceof Object) {
            strategy = "increment";
            Object.assign(options, strategyOrOptions);
        }
    }
    else {
        strategy = "increment";
    }
    if (maybeOptions instanceof Object)
        Object.assign(options, maybeOptions);
    return function (object, propertyName) {
        // check if there is no type in column options then set the int type - by default for auto generated column
        if (!options.type) {
            if (strategy === "increment") {
                Object.assign(options, { type: Number });
            }
            else {
                Object.assign(options, { type: "uuid" });
            }
        }
        // implicitly set a primary and generated to column options
        Object.assign(options, { primary: true });
        // create and register a new column metadata
        var columnArgs = {
            target: object.constructor,
            propertyName: propertyName,
            mode: "regular",
            options: options
        };
        index_1.getMetadataArgsStorage().columns.push(columnArgs);
        var generationArgs = {
            target: object.constructor,
            propertyName: propertyName,
            strategy: strategy
        };
        index_1.getMetadataArgsStorage().generations.push(generationArgs);
    };
}
exports.PrimaryGeneratedColumn = PrimaryGeneratedColumn;

//# sourceMappingURL=PrimaryGeneratedColumn.js.map
