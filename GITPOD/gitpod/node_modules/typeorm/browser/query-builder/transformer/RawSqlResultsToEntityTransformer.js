import { OrmUtils } from "../../util/OrmUtils";
/**
 * Transforms raw sql results returned from the database into entity object.
 * Entity is constructed based on its entity metadata.
 */
var RawSqlResultsToEntityTransformer = /** @class */ (function () {
    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    function RawSqlResultsToEntityTransformer(expressionMap, driver, rawRelationIdResults, rawRelationCountResults) {
        this.expressionMap = expressionMap;
        this.driver = driver;
        this.rawRelationIdResults = rawRelationIdResults;
        this.rawRelationCountResults = rawRelationCountResults;
    }
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    /**
     * Since db returns a duplicated rows of the data where accuracies of the same object can be duplicated
     * we need to group our result and we must have some unique id (primary key in our case)
     */
    RawSqlResultsToEntityTransformer.prototype.transform = function (rawResults, alias) {
        var _this = this;
        var group = this.group(rawResults, alias);
        var entities = [];
        group.forEach(function (results) {
            var entity = _this.transformRawResultsGroup(results, alias);
            if (entity !== undefined)
                entities.push(entity);
        });
        return entities;
    };
    // -------------------------------------------------------------------------
    // Protected Methods
    // -------------------------------------------------------------------------
    /**
     * Groups given raw results by ids of given alias.
     */
    RawSqlResultsToEntityTransformer.prototype.group = function (rawResults, alias) {
        var map = new Map();
        var keys = alias.metadata.primaryColumns.map(function (column) { return alias.name + "_" + column.databaseName; });
        rawResults.forEach(function (rawResult) {
            var id = keys.map(function (key) { return rawResult[key]; }).join("_"); // todo: check partial
            if (!id)
                return;
            var items = map.get(id);
            if (!items) {
                map.set(id, [rawResult]);
            }
            else {
                items.push(rawResult);
            }
        });
        return map;
    };
    /**
     * Transforms set of data results into single entity.
     */
    RawSqlResultsToEntityTransformer.prototype.transformRawResultsGroup = function (rawResults, alias) {
        var hasColumns = false, hasEmbeddedColumns = false, hasParentColumns = false, hasParentEmbeddedColumns = false, hasRelations = false, hasRelationIds = false, hasRelationCounts = false;
        var entity = alias.metadata.create();
        if (alias.metadata.discriminatorColumn) {
            var discriminatorValues_1 = rawResults.map(function (result) { return result[alias.name + "_" + alias.metadata.discriminatorColumn.databaseName]; });
            var metadata = alias.metadata.childEntityMetadatas.find(function (childEntityMetadata) {
                return !!discriminatorValues_1.find(function (value) { return value === childEntityMetadata.discriminatorValue; });
            });
            if (metadata)
                entity = metadata.create();
        }
        // get value from columns selections and put them into newly created entity
        hasColumns = this.transformColumns(rawResults, alias, entity, alias.metadata);
        hasRelations = this.transformJoins(rawResults, entity, alias);
        hasRelationIds = this.transformRelationIds(rawResults, alias, entity);
        hasRelationCounts = this.transformRelationCounts(rawResults, alias, entity);
        // this.removeVirtualColumns(entity, alias);
        return (hasColumns || hasEmbeddedColumns || hasParentColumns || hasParentEmbeddedColumns || hasRelations || hasRelationIds || hasRelationCounts) ? entity : undefined;
    };
    // get value from columns selections and put them into object
    RawSqlResultsToEntityTransformer.prototype.transformColumns = function (rawResults, alias, entity, metadata) {
        var _this = this;
        var hasData = false;
        metadata.columns.forEach(function (column) {
            var value = rawResults[0][alias.name + "_" + column.databaseName];
            if (value === undefined || column.isVirtual || column.isParentId || column.isDiscriminator)
                return;
            // if user does not selected the whole entity or he used partial selection and does not select this particular column
            // then we don't add this column and its value into the entity
            if (!_this.expressionMap.selects.find(function (select) { return select.selection === alias.name || select.selection === alias.name + "." + column.propertyName; }))
                return;
            column.setEntityValue(entity, _this.driver.prepareHydratedValue(value, column));
            if (value !== null) // we don't mark it as has data because if we will have all nulls in our object - we don't need such object
                hasData = true;
        });
        if (alias.metadata.parentEntityMetadata) {
            alias.metadata.parentEntityMetadata.columns.forEach(function (column) {
                var value = rawResults[0]["parentIdColumn_" + alias.metadata.parentEntityMetadata.tableName + "_" + column.databaseName];
                if (value === undefined || column.isVirtual || column.isParentId || column.isDiscriminator)
                    return;
                column.setEntityValue(entity, _this.driver.prepareHydratedValue(value, column));
                if (value !== null) // we don't mark it as has data because if we will have all nulls in our object - we don't need such object
                    hasData = true;
            });
        }
        return hasData;
    };
    /**
     * Transforms joined entities in the given raw results by a given alias and stores to the given (parent) entity
     */
    RawSqlResultsToEntityTransformer.prototype.transformJoins = function (rawResults, entity, alias) {
        var _this = this;
        var hasData = false;
        var discriminatorValue = "";
        if (alias.metadata.discriminatorColumn)
            discriminatorValue = rawResults[0][alias.name + "_" + alias.metadata.discriminatorColumn.databaseName];
        this.expressionMap.joinAttributes.forEach(function (join) {
            // skip joins without metadata
            if (!join.metadata)
                return;
            // this check need to avoid setting properties than not belong to entity when single table inheritance used.
            var metadata = alias.metadata.childEntityMetadatas.find(function (childEntityMetadata) { return discriminatorValue === childEntityMetadata.discriminatorValue; });
            if (metadata && join.relation && metadata.target !== join.relation.target)
                return;
            // some checks to make sure this join is for current alias
            if (join.mapToProperty) {
                if (join.mapToPropertyParentAlias !== alias.name)
                    return;
            }
            else {
                if (!join.relation || join.parentAlias !== alias.name || join.relationPropertyPath !== join.relation.propertyPath)
                    return;
            }
            // transform joined data into entities
            var mappedEntities = _this.transform(rawResults, join.alias);
            var result = !join.isMany ? mappedEntities[0] : mappedEntities;
            if (!result) // if nothing was joined then simply return
                return;
            // if join was mapped to some property then save result to that property
            if (join.mapToPropertyPropertyName) {
                entity[join.mapToPropertyPropertyName] = result; // todo: fix embeds
            }
            else { // otherwise set to relation
                join.relation.setEntityValue(entity, result);
            }
            hasData = true;
        });
        return hasData;
    };
    RawSqlResultsToEntityTransformer.prototype.transformRelationIds = function (rawSqlResults, alias, entity) {
        var _this = this;
        var hasData = false;
        this.rawRelationIdResults.forEach(function (rawRelationIdResult) {
            if (rawRelationIdResult.relationIdAttribute.parentAlias !== alias.name)
                return;
            var relation = rawRelationIdResult.relationIdAttribute.relation;
            var valueMap = _this.createValueMapFromJoinColumns(relation, rawRelationIdResult.relationIdAttribute.parentAlias, rawSqlResults);
            if (valueMap === undefined || valueMap === null)
                return;
            var idMaps = rawRelationIdResult.results.map(function (result) {
                var entityPrimaryIds = _this.extractEntityPrimaryIds(relation, result);
                if (!alias.metadata.compareIds(entityPrimaryIds, valueMap))
                    return;
                var columns;
                if (relation.isManyToOne || relation.isOneToOneOwner) {
                    columns = relation.joinColumns.map(function (joinColumn) { return joinColumn; });
                }
                else if (relation.isOneToMany || relation.isOneToOneNotOwner) {
                    columns = relation.inverseEntityMetadata.primaryColumns.map(function (joinColumn) { return joinColumn; });
                }
                else { // ManyToMany
                    if (relation.isOwning) {
                        columns = relation.inverseJoinColumns.map(function (joinColumn) { return joinColumn; });
                    }
                    else {
                        columns = relation.inverseRelation.joinColumns.map(function (joinColumn) { return joinColumn; });
                    }
                }
                // const idMapColumns = (relation.isOneToMany || relation.isOneToOneNotOwner) ? columns : columns.map(column => column.referencedColumn!);
                // const idMap = idMapColumns.reduce((idMap, column) => {
                //     return OrmUtils.mergeDeep(idMap, column.createValueMap(result[column.databaseName]));
                // }, {} as ObjectLiteral); // need to create reusable function for this process
                var idMap = columns.reduce(function (idMap, column) {
                    if (relation.isOneToMany || relation.isOneToOneNotOwner) {
                        return OrmUtils.mergeDeep(idMap, column.createValueMap(result[column.databaseName]));
                    }
                    else {
                        return OrmUtils.mergeDeep(idMap, column.referencedColumn.createValueMap(result[column.databaseName]));
                    }
                }, {});
                if (columns.length === 1 && rawRelationIdResult.relationIdAttribute.disableMixedMap === false) {
                    if (relation.isOneToMany || relation.isOneToOneNotOwner) {
                        return columns[0].getEntityValue(idMap);
                    }
                    else {
                        return columns[0].referencedColumn.getEntityValue(idMap);
                    }
                }
                return idMap;
            }).filter(function (result) { return result; });
            var properties = rawRelationIdResult.relationIdAttribute.mapToPropertyPropertyPath.split(".");
            var mapToProperty = function (properties, map, value) {
                var property = properties.shift();
                if (property && properties.length === 0) {
                    map[property] = value;
                    return map;
                }
                else if (property && properties.length > 0) {
                    mapToProperty(properties, map[property], value);
                }
                else {
                    return map;
                }
            };
            if (relation.isOneToOne || relation.isManyToOne) {
                if (idMaps[0] !== undefined) {
                    mapToProperty(properties, entity, idMaps[0]);
                    hasData = true;
                }
            }
            else {
                mapToProperty(properties, entity, idMaps);
                if (idMaps.length > 0) {
                    hasData = true;
                }
            }
        });
        return hasData;
    };
    RawSqlResultsToEntityTransformer.prototype.transformRelationCounts = function (rawSqlResults, alias, entity) {
        var hasData = false;
        this.rawRelationCountResults
            .filter(function (rawRelationCountResult) { return rawRelationCountResult.relationCountAttribute.parentAlias === alias.name; })
            .forEach(function (rawRelationCountResult) {
            var relation = rawRelationCountResult.relationCountAttribute.relation;
            var referenceColumnName;
            if (relation.isOneToMany) {
                referenceColumnName = relation.inverseRelation.joinColumns[0].referencedColumn.databaseName; // todo: fix joinColumns[0]
            }
            else {
                referenceColumnName = relation.isOwning ? relation.joinColumns[0].referencedColumn.databaseName : relation.inverseRelation.joinColumns[0].referencedColumn.databaseName;
            }
            var referenceColumnValue = rawSqlResults[0][alias.name + "_" + referenceColumnName]; // we use zero index since its grouped data // todo: selection with alias for entity columns wont work
            if (referenceColumnValue !== undefined && referenceColumnValue !== null) {
                entity[rawRelationCountResult.relationCountAttribute.mapToPropertyPropertyName] = 0;
                rawRelationCountResult.results
                    .filter(function (result) { return result["parentId"] === referenceColumnValue; })
                    .forEach(function (result) {
                    entity[rawRelationCountResult.relationCountAttribute.mapToPropertyPropertyName] = parseInt(result["cnt"]);
                    hasData = true;
                });
            }
        });
        return hasData;
    };
    RawSqlResultsToEntityTransformer.prototype.createValueMapFromJoinColumns = function (relation, parentAlias, rawSqlResults) {
        var columns;
        if (relation.isManyToOne || relation.isOneToOneOwner) {
            columns = relation.entityMetadata.primaryColumns.map(function (joinColumn) { return joinColumn; });
        }
        else if (relation.isOneToMany || relation.isOneToOneNotOwner) {
            columns = relation.inverseRelation.joinColumns.map(function (joinColumn) { return joinColumn; });
        }
        else {
            if (relation.isOwning) {
                columns = relation.joinColumns.map(function (joinColumn) { return joinColumn; });
            }
            else {
                columns = relation.inverseRelation.inverseJoinColumns.map(function (joinColumn) { return joinColumn; });
            }
        }
        return columns.reduce(function (valueMap, column) {
            rawSqlResults.forEach(function (rawSqlResult) {
                if (relation.isManyToOne || relation.isOneToOneOwner) {
                    valueMap[column.databaseName] = rawSqlResult[parentAlias + "_" + column.databaseName];
                }
                else {
                    valueMap[column.databaseName] = rawSqlResult[parentAlias + "_" + column.referencedColumn.databaseName];
                }
            });
            return valueMap;
        }, {});
    };
    RawSqlResultsToEntityTransformer.prototype.extractEntityPrimaryIds = function (relation, relationIdRawResult) {
        var columns;
        if (relation.isManyToOne || relation.isOneToOneOwner) {
            columns = relation.entityMetadata.primaryColumns.map(function (joinColumn) { return joinColumn; });
        }
        else if (relation.isOneToMany || relation.isOneToOneNotOwner) {
            columns = relation.inverseRelation.joinColumns.map(function (joinColumn) { return joinColumn; });
        }
        else {
            if (relation.isOwning) {
                columns = relation.joinColumns.map(function (joinColumn) { return joinColumn; });
            }
            else {
                columns = relation.inverseRelation.inverseJoinColumns.map(function (joinColumn) { return joinColumn; });
            }
        }
        return columns.reduce(function (data, column) {
            data[column.databaseName] = relationIdRawResult[column.databaseName];
            return data;
        }, {});
    };
    return RawSqlResultsToEntityTransformer;
}());
export { RawSqlResultsToEntityTransformer };

//# sourceMappingURL=RawSqlResultsToEntityTransformer.js.map
