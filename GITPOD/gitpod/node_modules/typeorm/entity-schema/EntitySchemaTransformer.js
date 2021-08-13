"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MetadataArgsStorage_1 = require("../metadata-args/MetadataArgsStorage");
/**
 * Transforms entity schema into metadata args storage.
 * The result will be just like entities read from decorators.
 */
var EntitySchemaTransformer = /** @class */ (function () {
    function EntitySchemaTransformer() {
    }
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    /**
     * Transforms entity schema into new metadata args storage object.
     */
    EntitySchemaTransformer.prototype.transform = function (schemas) {
        var metadataArgsStorage = new MetadataArgsStorage_1.MetadataArgsStorage();
        schemas.forEach(function (schema) {
            // add table metadata args from the schema
            var table = schema.table || {};
            var tableMetadata = {
                target: schema.target || schema.name,
                name: table.name,
                type: table.type || "regular",
                orderBy: table.orderBy
            };
            metadataArgsStorage.tables.push(tableMetadata);
            // add columns metadata args from the schema
            Object.keys(schema.columns).forEach(function (columnName) {
                var tableColumn = schema.columns[columnName];
                var mode = "regular";
                if (tableColumn.createDate)
                    mode = "createDate";
                if (tableColumn.updateDate)
                    mode = "updateDate";
                if (tableColumn.version)
                    mode = "version";
                if (tableColumn.treeChildrenCount)
                    mode = "treeChildrenCount";
                if (tableColumn.treeLevel)
                    mode = "treeLevel";
                var columnAgrs = {
                    target: schema.target || schema.name,
                    mode: mode,
                    propertyName: columnName,
                    options: {
                        type: tableColumn.type,
                        name: tableColumn.name,
                        length: tableColumn.length,
                        primary: tableColumn.primary,
                        unique: tableColumn.unique,
                        nullable: tableColumn.nullable,
                        comment: tableColumn.comment,
                        default: tableColumn.default,
                        precision: tableColumn.precision,
                        scale: tableColumn.scale
                    }
                };
                metadataArgsStorage.columns.push(columnAgrs);
                if (tableColumn.generated) {
                    var generationArgs = {
                        target: schema.target || schema.name,
                        propertyName: columnName,
                        strategy: typeof tableColumn.generated === "string" ? tableColumn.generated : "increment"
                    };
                    metadataArgsStorage.generations.push(generationArgs);
                }
            });
            // add relation metadata args from the schema
            if (schema.relations) {
                Object.keys(schema.relations).forEach(function (relationName) {
                    var relationSchema = schema.relations[relationName];
                    var relation = {
                        target: schema.target || schema.name,
                        propertyName: relationName,
                        relationType: relationSchema.type,
                        isLazy: relationSchema.isLazy || false,
                        type: relationSchema.target,
                        inverseSideProperty: relationSchema.inverseSide,
                        isTreeParent: relationSchema.isTreeParent,
                        isTreeChildren: relationSchema.isTreeChildren,
                        options: {
                            cascadeAll: relationSchema.cascadeAll,
                            cascadeInsert: relationSchema.cascadeInsert,
                            cascadeUpdate: relationSchema.cascadeUpdate,
                            cascadeRemove: relationSchema.cascadeRemove,
                            nullable: relationSchema.nullable,
                            onDelete: relationSchema.onDelete
                        }
                    };
                    metadataArgsStorage.relations.push(relation);
                    // add join column
                    if (relationSchema.joinColumn) {
                        if (typeof relationSchema.joinColumn === "boolean") {
                            var joinColumn = {
                                target: schema.target || schema.name,
                                propertyName: relationName
                            };
                            metadataArgsStorage.joinColumns.push(joinColumn);
                        }
                        else {
                            var joinColumn = {
                                target: schema.target || schema.name,
                                propertyName: relationName,
                                name: relationSchema.joinColumn.name,
                                referencedColumnName: relationSchema.joinColumn.referencedColumnName
                            };
                            metadataArgsStorage.joinColumns.push(joinColumn);
                        }
                    }
                    // add join table
                    if (relationSchema.joinTable) {
                        if (typeof relationSchema.joinTable === "boolean") {
                            var joinTable = {
                                target: schema.target || schema.name,
                                propertyName: relationName
                            };
                            metadataArgsStorage.joinTables.push(joinTable);
                        }
                        else {
                            var joinTable = {
                                target: schema.target || schema.name,
                                propertyName: relationName,
                                name: relationSchema.joinTable.name,
                                joinColumns: (relationSchema.joinTable.joinColumn ? [relationSchema.joinTable.joinColumn] : relationSchema.joinTable.joinColumns),
                                inverseJoinColumns: (relationSchema.joinTable.inverseJoinColumn ? [relationSchema.joinTable.inverseJoinColumn] : relationSchema.joinTable.inverseJoinColumns),
                            };
                            metadataArgsStorage.joinTables.push(joinTable);
                        }
                    }
                });
            }
            // add relation metadata args from the schema
            if (schema.indices) {
                Object.keys(schema.indices).forEach(function (indexName) {
                    var tableIndex = schema.indices[indexName];
                    var indexAgrs = {
                        target: schema.target || schema.name,
                        name: indexName,
                        unique: tableIndex.unique,
                        sparse: tableIndex.sparse,
                        columns: tableIndex.columns
                    };
                    metadataArgsStorage.indices.push(indexAgrs);
                });
            }
        });
        return metadataArgsStorage;
    };
    return EntitySchemaTransformer;
}());
exports.EntitySchemaTransformer = EntitySchemaTransformer;

//# sourceMappingURL=EntitySchemaTransformer.js.map
