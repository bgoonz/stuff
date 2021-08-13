"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EntityMetadata_1 = require("../metadata/EntityMetadata");
var ColumnMetadata_1 = require("../metadata/ColumnMetadata");
var IndexMetadata_1 = require("../metadata/IndexMetadata");
var RelationMetadata_1 = require("../metadata/RelationMetadata");
var EmbeddedMetadata_1 = require("../metadata/EmbeddedMetadata");
var RelationIdMetadata_1 = require("../metadata/RelationIdMetadata");
var RelationCountMetadata_1 = require("../metadata/RelationCountMetadata");
var MetadataUtils_1 = require("./MetadataUtils");
var JunctionEntityMetadataBuilder_1 = require("./JunctionEntityMetadataBuilder");
var ClosureJunctionEntityMetadataBuilder_1 = require("./ClosureJunctionEntityMetadataBuilder");
var RelationJoinColumnBuilder_1 = require("./RelationJoinColumnBuilder");
var EntityListenerMetadata_1 = require("../metadata/EntityListenerMetadata");
var ForeignKeyMetadata_1 = require("../metadata/ForeignKeyMetadata");
var LazyRelationsWrapper_1 = require("../lazy-loading/LazyRelationsWrapper");
/**
 * Builds EntityMetadata objects and all its sub-metadatas.
 */
var EntityMetadataBuilder = /** @class */ (function () {
    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    function EntityMetadataBuilder(connection, metadataArgsStorage) {
        this.connection = connection;
        this.metadataArgsStorage = metadataArgsStorage;
        this.junctionEntityMetadataBuilder = new JunctionEntityMetadataBuilder_1.JunctionEntityMetadataBuilder(connection);
        this.closureJunctionEntityMetadataBuilder = new ClosureJunctionEntityMetadataBuilder_1.ClosureJunctionEntityMetadataBuilder(connection);
        this.relationJoinColumnBuilder = new RelationJoinColumnBuilder_1.RelationJoinColumnBuilder(connection);
    }
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    /**
     * Builds a complete entity metadatas for the given entity classes.
     */
    EntityMetadataBuilder.prototype.build = function (entityClasses) {
        var _this = this;
        // if entity classes to filter entities by are given then do filtering, otherwise use all
        var allTables = entityClasses ? this.metadataArgsStorage.filterTables(entityClasses) : this.metadataArgsStorage.tables;
        // filter out table metadata args for those we really create entity metadatas and tables in the db
        var realTables = allTables.filter(function (table) { return table.type === "regular" || table.type === "closure" || table.type === "class-table-child" || table.type === "single-table-child"; });
        // create entity metadatas for a user defined entities (marked with @Entity decorator or loaded from entity schemas)
        var entityMetadatas = realTables.map(function (tableArgs) { return _this.createEntityMetadata(tableArgs); });
        // calculate entity metadata computed properties and all its sub-metadatas
        entityMetadatas.forEach(function (entityMetadata) { return _this.computeEntityMetadata(entityMetadata); });
        // calculate entity metadata's inverse properties
        entityMetadatas.forEach(function (entityMetadata) { return _this.computeInverseProperties(entityMetadata, entityMetadatas); });
        // go through all entity metadatas and create foreign keys / junction entity metadatas for their relations
        entityMetadatas
            .filter(function (entityMetadata) { return entityMetadata.tableType !== "single-table-child"; })
            .forEach(function (entityMetadata) {
            // create entity's relations join columns (for many-to-one and one-to-one owner)
            entityMetadata.relations.filter(function (relation) { return relation.isOneToOne || relation.isManyToOne; }).forEach(function (relation) {
                var joinColumns = _this.metadataArgsStorage.filterJoinColumns(relation.target, relation.propertyName);
                var foreignKey = _this.relationJoinColumnBuilder.build(joinColumns, relation); // create a foreign key based on its metadata args
                if (foreignKey) {
                    relation.registerForeignKeys(foreignKey); // push it to the relation and thus register there a join column
                    entityMetadata.foreignKeys.push(foreignKey);
                }
            });
            // create junction entity metadatas for entity many-to-many relations
            entityMetadata.relations.filter(function (relation) { return relation.isManyToMany; }).forEach(function (relation) {
                var joinTable = _this.metadataArgsStorage.findJoinTable(relation.target, relation.propertyName);
                if (!joinTable)
                    return; // no join table set - no need to do anything (it means this is many-to-many inverse side)
                // here we create a junction entity metadata for a new junction table of many-to-many relation
                var junctionEntityMetadata = _this.junctionEntityMetadataBuilder.build(relation, joinTable);
                relation.registerForeignKeys.apply(relation, junctionEntityMetadata.foreignKeys);
                relation.registerJunctionEntityMetadata(junctionEntityMetadata);
                // compute new entity metadata properties and push it to entity metadatas pool
                _this.computeEntityMetadata(junctionEntityMetadata);
                _this.computeInverseProperties(junctionEntityMetadata, entityMetadatas);
                entityMetadatas.push(junctionEntityMetadata);
            });
            // update entity metadata depend properties
            entityMetadata.relationsWithJoinColumns = entityMetadata.relations.filter(function (relation) { return relation.isWithJoinColumn; });
            entityMetadata.hasNonNullableRelations = entityMetadata.relationsWithJoinColumns.some(function (relation) { return !relation.isNullable || relation.isPrimary; });
        });
        // generate closure junction tables for all closure tables
        entityMetadatas
            .filter(function (metadata) { return metadata.isClosure; })
            .forEach(function (entityMetadata) {
            var closureJunctionEntityMetadata = _this.closureJunctionEntityMetadataBuilder.build(entityMetadata);
            entityMetadata.closureJunctionTable = closureJunctionEntityMetadata;
            _this.computeEntityMetadata(closureJunctionEntityMetadata);
            _this.computeInverseProperties(closureJunctionEntityMetadata, entityMetadatas);
            entityMetadatas.push(closureJunctionEntityMetadata);
        });
        // after all metadatas created we set parent entity metadata for class-table inheritance
        entityMetadatas
            .filter(function (metadata) { return metadata.tableType === "single-table-child" || metadata.tableType === "class-table-child"; })
            .forEach(function (entityMetadata) {
            var inheritanceTree = entityMetadata.target instanceof Function
                ? MetadataUtils_1.MetadataUtils.getInheritanceTree(entityMetadata.target)
                : [entityMetadata.target];
            var parentMetadata = entityMetadatas.find(function (metadata) {
                return inheritanceTree.find(function (inheritance) { return inheritance === metadata.target; }) && (metadata.inheritanceType === "single-table" || metadata.inheritanceType === "class-table");
            });
            if (parentMetadata) {
                entityMetadata.parentEntityMetadata = parentMetadata;
                if (parentMetadata.inheritanceType === "single-table")
                    entityMetadata.tableName = parentMetadata.tableName;
            }
        });
        // after all metadatas created we set child entity metadatas for class-table inheritance
        entityMetadatas.forEach(function (metadata) {
            metadata.childEntityMetadatas = entityMetadatas.filter(function (childMetadata) {
                return metadata.target instanceof Function
                    && childMetadata.target instanceof Function
                    && MetadataUtils_1.MetadataUtils.isInherited(childMetadata.target, metadata.target);
            });
        });
        // generate keys for tables with single-table inheritance
        entityMetadatas
            .filter(function (metadata) { return metadata.inheritanceType === "single-table" && metadata.discriminatorColumn; })
            .forEach(function (entityMetadata) { return _this.createKeysForTableInheritance(entityMetadata); });
        // build all indices (need to do it after relations and their join columns are built)
        entityMetadatas.forEach(function (entityMetadata) {
            entityMetadata.indices.forEach(function (index) { return index.build(_this.connection.namingStrategy); });
        });
        entityMetadatas
            .filter(function (metadata) { return !!metadata.parentEntityMetadata && metadata.tableType === "class-table-child"; })
            .forEach(function (metadata) {
            var parentPrimaryColumns = metadata.parentEntityMetadata.primaryColumns;
            var parentRelationColumns = parentPrimaryColumns.map(function (parentPrimaryColumn) {
                var columnName = _this.connection.namingStrategy.classTableInheritanceParentColumnName(metadata.parentEntityMetadata.tableName, parentPrimaryColumn.propertyPath);
                var column = new ColumnMetadata_1.ColumnMetadata({
                    connection: _this.connection,
                    entityMetadata: metadata,
                    referencedColumn: parentPrimaryColumn,
                    args: {
                        target: metadata.target,
                        propertyName: columnName,
                        mode: "parentId",
                        options: {
                            name: columnName,
                            type: parentPrimaryColumn.type,
                            unique: false,
                            nullable: false,
                            primary: true
                        }
                    }
                });
                metadata.registerColumn(column);
                column.build(_this.connection);
                return column;
            });
            metadata.foreignKeys = [
                new ForeignKeyMetadata_1.ForeignKeyMetadata({
                    entityMetadata: metadata,
                    referencedEntityMetadata: metadata.parentEntityMetadata,
                    namingStrategy: _this.connection.namingStrategy,
                    columns: parentRelationColumns,
                    referencedColumns: parentPrimaryColumns,
                    onDelete: "CASCADE"
                })
            ];
        });
        // add lazy initializer for entity relations
        entityMetadatas
            .filter(function (metadata) { return metadata.target instanceof Function; })
            .forEach(function (entityMetadata) {
            entityMetadata.relations
                .filter(function (relation) { return relation.isLazy; })
                .forEach(function (relation) {
                var lazyRelationsWrapper = new LazyRelationsWrapper_1.LazyRelationsWrapper(_this.connection);
                lazyRelationsWrapper.wrap(entityMetadata.target.prototype, relation);
            });
        });
        entityMetadatas.forEach(function (entityMetadata) {
            entityMetadata.columns.forEach(function (column) {
                // const target = column.embeddedMetadata ? column.embeddedMetadata.type : column.target;
                var generated = _this.metadataArgsStorage.findGenerated(column.target, column.propertyName);
                if (generated) {
                    column.isGenerated = true;
                    column.generationStrategy = generated.strategy;
                    column.type = generated.strategy === "increment" ? (column.type || Number) : "uuid";
                    column.build(_this.connection);
                    _this.computeEntityMetadata(entityMetadata);
                }
            });
        });
        return entityMetadatas;
    };
    // -------------------------------------------------------------------------
    // Protected Methods
    // -------------------------------------------------------------------------
    /**
     * Creates entity metadata from the given table args.
     * Creates column, relation, etc. metadatas for everything this entity metadata owns.
     */
    EntityMetadataBuilder.prototype.createEntityMetadata = function (tableArgs) {
        var _this = this;
        // we take all "inheritance tree" from a target entity to collect all stored metadata args
        // (by decorators or inside entity schemas). For example for target Post < ContentModel < Unit
        // it will be an array of [Post, ContentModel, Unit] and we can then get all metadata args of those classes
        var inheritanceTree = tableArgs.target instanceof Function
            ? MetadataUtils_1.MetadataUtils.getInheritanceTree(tableArgs.target)
            : [tableArgs.target]; // todo: implement later here inheritance for string-targets
        // if single table inheritance used, we need to copy all children columns in to parent table
        var singleTableChildrenTargets;
        if (tableArgs.type === "single-table-child") {
            singleTableChildrenTargets = this.metadataArgsStorage
                .filterSingleTableChildren(tableArgs.target)
                .map(function (args) { return args.target; })
                .filter(function (target) { return target instanceof Function; });
            inheritanceTree.push.apply(inheritanceTree, singleTableChildrenTargets);
        }
        else if (tableArgs.type === "class-table-child") {
            inheritanceTree.forEach(function (inheritanceTreeItem) {
                var isParent = !!_this.metadataArgsStorage.inheritances.find(function (i) { return i.target === inheritanceTreeItem; });
                if (isParent)
                    inheritanceTree.splice(inheritanceTree.indexOf(inheritanceTreeItem), 1);
            });
        }
        var entityMetadata = new EntityMetadata_1.EntityMetadata({
            connection: this.connection,
            args: tableArgs
        });
        var inheritanceType = this.metadataArgsStorage.findInheritanceType(tableArgs.target);
        entityMetadata.inheritanceType = inheritanceType ? inheritanceType.type : undefined;
        var discriminatorValue = this.metadataArgsStorage.findDiscriminatorValue(tableArgs.target);
        entityMetadata.discriminatorValue = discriminatorValue ? discriminatorValue.value : tableArgs.target.name; // todo: pass this to naming strategy to generate a name
        entityMetadata.embeddeds = this.createEmbeddedsRecursively(entityMetadata, this.metadataArgsStorage.filterEmbeddeds(inheritanceTree));
        entityMetadata.ownColumns = this.metadataArgsStorage
            .filterColumns(inheritanceTree)
            .map(function (args) {
            var column = new ColumnMetadata_1.ColumnMetadata({ connection: _this.connection, entityMetadata: entityMetadata, args: args });
            // console.log(column.propertyName);
            // if single table inheritance used, we need to mark all inherit table columns as nullable
            if (singleTableChildrenTargets && singleTableChildrenTargets.indexOf(args.target) !== -1)
                column.isNullable = true;
            return column;
        });
        entityMetadata.ownRelations = this.metadataArgsStorage.filterRelations(inheritanceTree).map(function (args) {
            return new RelationMetadata_1.RelationMetadata({ entityMetadata: entityMetadata, args: args });
        });
        entityMetadata.relationIds = this.metadataArgsStorage.filterRelationIds(inheritanceTree).map(function (args) {
            return new RelationIdMetadata_1.RelationIdMetadata({ entityMetadata: entityMetadata, args: args });
        });
        entityMetadata.relationCounts = this.metadataArgsStorage.filterRelationCounts(inheritanceTree).map(function (args) {
            return new RelationCountMetadata_1.RelationCountMetadata({ entityMetadata: entityMetadata, args: args });
        });
        entityMetadata.ownIndices = this.metadataArgsStorage.filterIndices(inheritanceTree).map(function (args) {
            return new IndexMetadata_1.IndexMetadata({ entityMetadata: entityMetadata, args: args });
        });
        entityMetadata.ownListeners = this.metadataArgsStorage.filterListeners(inheritanceTree).map(function (args) {
            return new EntityListenerMetadata_1.EntityListenerMetadata({ entityMetadata: entityMetadata, args: args });
        });
        return entityMetadata;
    };
    /**
     * Creates from the given embedded metadata args real embedded metadatas with its columns and relations,
     * and does the same for all its sub-embeddeds (goes recursively).
     */
    EntityMetadataBuilder.prototype.createEmbeddedsRecursively = function (entityMetadata, embeddedArgs) {
        var _this = this;
        return embeddedArgs.map(function (embeddedArgs) {
            var embeddedMetadata = new EmbeddedMetadata_1.EmbeddedMetadata({ entityMetadata: entityMetadata, args: embeddedArgs });
            var targets = MetadataUtils_1.MetadataUtils.getInheritanceTree(embeddedMetadata.type);
            embeddedMetadata.columns = _this.metadataArgsStorage.filterColumns(targets).map(function (args) {
                return new ColumnMetadata_1.ColumnMetadata({ connection: _this.connection, entityMetadata: entityMetadata, embeddedMetadata: embeddedMetadata, args: args });
            });
            embeddedMetadata.relations = _this.metadataArgsStorage.filterRelations(targets).map(function (args) {
                return new RelationMetadata_1.RelationMetadata({ entityMetadata: entityMetadata, embeddedMetadata: embeddedMetadata, args: args });
            });
            embeddedMetadata.listeners = _this.metadataArgsStorage.filterListeners(targets).map(function (args) {
                return new EntityListenerMetadata_1.EntityListenerMetadata({ entityMetadata: entityMetadata, embeddedMetadata: embeddedMetadata, args: args });
            });
            embeddedMetadata.indices = _this.metadataArgsStorage.filterIndices(targets).map(function (args) {
                return new IndexMetadata_1.IndexMetadata({ entityMetadata: entityMetadata, embeddedMetadata: embeddedMetadata, args: args });
            });
            embeddedMetadata.relationIds = _this.metadataArgsStorage.filterRelationIds(targets).map(function (args) {
                return new RelationIdMetadata_1.RelationIdMetadata({ entityMetadata: entityMetadata, args: args });
            });
            embeddedMetadata.relationCounts = _this.metadataArgsStorage.filterRelationCounts(targets).map(function (args) {
                return new RelationCountMetadata_1.RelationCountMetadata({ entityMetadata: entityMetadata, args: args });
            });
            embeddedMetadata.embeddeds = _this.createEmbeddedsRecursively(entityMetadata, _this.metadataArgsStorage.filterEmbeddeds(targets));
            embeddedMetadata.embeddeds.forEach(function (subEmbedded) { return subEmbedded.parentEmbeddedMetadata = embeddedMetadata; });
            return embeddedMetadata;
        });
    };
    /**
     * Computes all entity metadata's computed properties, and all its sub-metadatas (relations, columns, embeds, etc).
     */
    EntityMetadataBuilder.prototype.computeEntityMetadata = function (entityMetadata) {
        var _this = this;
        entityMetadata.embeddeds.forEach(function (embedded) { return embedded.build(_this.connection); });
        entityMetadata.embeddeds.forEach(function (embedded) {
            embedded.columnsFromTree.forEach(function (column) { return column.build(_this.connection); });
            embedded.relationsFromTree.forEach(function (relation) { return relation.build(); });
        });
        entityMetadata.ownColumns.forEach(function (column) { return column.build(_this.connection); });
        entityMetadata.ownRelations.forEach(function (relation) { return relation.build(); });
        entityMetadata.relations = entityMetadata.embeddeds.reduce(function (relations, embedded) { return relations.concat(embedded.relationsFromTree); }, entityMetadata.ownRelations);
        entityMetadata.eagerRelations = entityMetadata.relations.filter(function (relation) { return relation.isEager; });
        entityMetadata.lazyRelations = entityMetadata.relations.filter(function (relation) { return relation.isLazy; });
        entityMetadata.oneToOneRelations = entityMetadata.relations.filter(function (relation) { return relation.isOneToOne; });
        entityMetadata.oneToManyRelations = entityMetadata.relations.filter(function (relation) { return relation.isOneToMany; });
        entityMetadata.manyToOneRelations = entityMetadata.relations.filter(function (relation) { return relation.isManyToOne; });
        entityMetadata.manyToManyRelations = entityMetadata.relations.filter(function (relation) { return relation.isManyToMany; });
        entityMetadata.ownerOneToOneRelations = entityMetadata.relations.filter(function (relation) { return relation.isOneToOneOwner; });
        entityMetadata.ownerManyToManyRelations = entityMetadata.relations.filter(function (relation) { return relation.isManyToManyOwner; });
        entityMetadata.treeParentRelation = entityMetadata.relations.find(function (relation) { return relation.isTreeParent; });
        entityMetadata.treeChildrenRelation = entityMetadata.relations.find(function (relation) { return relation.isTreeChildren; });
        entityMetadata.columns = entityMetadata.embeddeds.reduce(function (columns, embedded) { return columns.concat(embedded.columnsFromTree); }, entityMetadata.ownColumns);
        entityMetadata.listeners = entityMetadata.embeddeds.reduce(function (columns, embedded) { return columns.concat(embedded.listenersFromTree); }, entityMetadata.ownListeners);
        entityMetadata.indices = entityMetadata.embeddeds.reduce(function (columns, embedded) { return columns.concat(embedded.indicesFromTree); }, entityMetadata.ownIndices);
        entityMetadata.primaryColumns = entityMetadata.columns.filter(function (column) { return column.isPrimary; });
        entityMetadata.hasMultiplePrimaryKeys = entityMetadata.primaryColumns.length > 1;
        entityMetadata.generatedColumns = entityMetadata.columns.filter(function (column) { return column.isGenerated || column.isObjectId; });
        entityMetadata.createDateColumn = entityMetadata.columns.find(function (column) { return column.isCreateDate; });
        entityMetadata.updateDateColumn = entityMetadata.columns.find(function (column) { return column.isUpdateDate; });
        entityMetadata.versionColumn = entityMetadata.columns.find(function (column) { return column.isVersion; });
        entityMetadata.discriminatorColumn = entityMetadata.columns.find(function (column) { return column.isDiscriminator; });
        entityMetadata.treeLevelColumn = entityMetadata.columns.find(function (column) { return column.isTreeLevel; });
        entityMetadata.parentIdColumns = entityMetadata.columns.filter(function (column) { return column.isParentId; });
        entityMetadata.objectIdColumn = entityMetadata.columns.find(function (column) { return column.isObjectId; });
        entityMetadata.foreignKeys.forEach(function (foreignKey) { return foreignKey.build(_this.connection.namingStrategy); });
        entityMetadata.propertiesMap = entityMetadata.createPropertiesMap();
        entityMetadata.relationIds.forEach(function (relationId) { return relationId.build(); });
        entityMetadata.relationCounts.forEach(function (relationCount) { return relationCount.build(); });
        entityMetadata.embeddeds.forEach(function (embedded) {
            embedded.relationIdsFromTree.forEach(function (relationId) { return relationId.build(); });
            embedded.relationCountsFromTree.forEach(function (relationCount) { return relationCount.build(); });
        });
    };
    /**
     * Computes entity metadata's relations inverse side properties.
     */
    EntityMetadataBuilder.prototype.computeInverseProperties = function (entityMetadata, entityMetadatas) {
        entityMetadata.relations.forEach(function (relation) {
            // compute inverse side (related) entity metadatas for all relation metadatas
            var inverseEntityMetadata = entityMetadatas.find(function (m) { return m.target === relation.type || (typeof relation.type === "string" && m.targetName === relation.type); });
            if (!inverseEntityMetadata)
                throw new Error("Entity metadata for " + entityMetadata.name + "#" + relation.propertyPath + " was not found. Check if you specified a correct entity object, check its really entity and its connected in the connection options.");
            relation.inverseEntityMetadata = inverseEntityMetadata;
            relation.inverseSidePropertyPath = relation.buildInverseSidePropertyPath();
            // and compute inverse relation and mark if it has such
            relation.inverseRelation = inverseEntityMetadata.relations.find(function (foundRelation) { return foundRelation.propertyPath === relation.inverseSidePropertyPath; });
        });
    };
    /**
     * Creates indices for the table of single table inheritance.
     */
    EntityMetadataBuilder.prototype.createKeysForTableInheritance = function (entityMetadata) {
        entityMetadata.indices.push(new IndexMetadata_1.IndexMetadata({
            entityMetadata: entityMetadata,
            columns: [entityMetadata.discriminatorColumn],
            args: {
                target: entityMetadata.target,
                unique: false
            }
        }), new IndexMetadata_1.IndexMetadata({
            entityMetadata: entityMetadata,
            columns: entityMetadata.primaryColumns.concat([entityMetadata.discriminatorColumn]),
            args: {
                target: entityMetadata.target,
                unique: false
            }
        }));
    };
    return EntityMetadataBuilder;
}());
exports.EntityMetadataBuilder = EntityMetadataBuilder;
// generate virtual column with foreign key for class-table inheritance
/*entityMetadatas.forEach(entityMetadata => {
 if (!entityMetadata.parentEntityMetadata)
 return;

 const parentPrimaryColumns = entityMetadata.parentEntityMetadata.primaryColumns;
 const parentIdColumns = parentPrimaryColumns.map(primaryColumn => {
 const columnName = this.namingStrategy.classTableInheritanceParentColumnName(entityMetadata.parentEntityMetadata.tableName, primaryColumn.propertyName);
 const column = new ColumnMetadataBuilder(entityMetadata);
 column.type = primaryColumn.type;
 column.propertyName = primaryColumn.propertyName; // todo: check why needed
 column.givenName = columnName;
 column.mode = "parentId";
 column.isUnique = true;
 column.isNullable = false;
 // column.entityTarget = entityMetadata.target;
 return column;
 });

 // add foreign key
 const foreignKey = new ForeignKeyMetadataBuilder(
 entityMetadata,
 parentIdColumns,
 entityMetadata.parentEntityMetadata,
 parentPrimaryColumns,
 "CASCADE"
 );
 entityMetadata.ownColumns.push(...parentIdColumns);
 entityMetadata.foreignKeys.push(foreignKey);
 });*/
/*protected createEntityMetadata(metadata: EntityMetadata, options: {
 userSpecifiedTableName?: string,
 closureOwnerTableName?: string,
 }) {

 const tableNameUserSpecified = options.userSpecifiedTableName;
 const isClosureJunction = metadata.tableType === "closure-junction";
 const targetName = metadata.target instanceof Function ? (metadata.target as any).name : metadata.target;
 const tableNameWithoutPrefix = isClosureJunction
 ? this.namingStrategy.closureJunctionTableName(options.closureOwnerTableName!)
 : this.namingStrategy.tableName(targetName, options.userSpecifiedTableName);

 const tableName = this.namingStrategy.prefixTableName(this.driver.options.tablesPrefix, tableNameWithoutPrefix);

 // for virtual tables (like junction table) target is equal to undefined at this moment
 // we change this by setting virtual's table name to a target name
 // todo: add validation so targets with same schema names won't conflicts with virtual table names
 metadata.target = metadata.target ? metadata.target : tableName;
 metadata.targetName = targetName;
 metadata.givenTableName = tableNameUserSpecified;
 metadata.tableNameWithoutPrefix = tableNameWithoutPrefix;
 metadata.tableName = tableName;
 metadata.name = targetName ? targetName : tableName;
 // metadata.namingStrategy = this.namingStrategy;
 }*/
/*protected createEntityMetadata(tableArgs: any, argsForTable: any, ): EntityMetadata {
 const metadata = new EntityMetadata({
 junction: false,
 target: tableArgs.target,
 tablesPrefix: this.driver.options.tablesPrefix,
 namingStrategy: this.namingStrategy,
 tableName: argsForTable.name,
 tableType: argsForTable.type,
 orderBy: argsForTable.orderBy,
 engine: argsForTable.engine,
 skipSchemaSync: argsForTable.skipSchemaSync,
 columnMetadatas: columns,
 relationMetadatas: relations,
 relationIdMetadatas: relationIds,
 relationCountMetadatas: relationCounts,
 indexMetadatas: indices,
 embeddedMetadatas: embeddeds,
 inheritanceType: mergedArgs.inheritance ? mergedArgs.inheritance.type : undefined,
 discriminatorValue: discriminatorValueArgs ? discriminatorValueArgs.value : (tableArgs.target as any).name // todo: pass this to naming strategy to generate a name
 }, this.lazyRelationsWrapper);
 return metadata;
 }*/
// const tables = [mergedArgs.table].concat(mergedArgs.children);
// tables.forEach(tableArgs => {
// find embeddable tables for embeddeds registered in this table and create EmbeddedMetadatas from them
// const findEmbeddedsRecursively = (embeddedArgs: EmbeddedMetadataArgs[]) => {
//     const embeddeds: EmbeddedMetadata[] = [];
//     embeddedArgs.forEach(embedded => {
//         const embeddableTable = embeddableMergedArgs.find(embeddedMergedArgs => embeddedMergedArgs.table.target === embedded.type());
//         if (embeddableTable) {
//             const columns = embeddableTable.columns.toArray().map(args => new ColumnMetadata(args));
//             const relations = embeddableTable.relations.toArray().map(args => new RelationMetadata(args));
//             const subEmbeddeds = findEmbeddedsRecursively(embeddableTable.embeddeds.toArray());
//             embeddeds.push(new EmbeddedMetadata(columns, relations, subEmbeddeds, embedded));
//         }
//     });
//     return embeddeds;
// };
// const embeddeds = findEmbeddedsRecursively(mergedArgs.embeddeds.toArray());
// create metadatas from args
// const argsForTable = mergedArgs.inheritance && mergedArgs.inheritance.type === "single-table" ? mergedArgs.table : tableArgs;
// const table = new TableMetadata(argsForTable);
// const columns = mergedArgs.columns.toArray().map(args => {
//
//     // if column's target is a child table then this column should have all nullable columns
//     if (mergedArgs.inheritance &&
//         mergedArgs.inheritance.type === "single-table" &&
//         args.target !== mergedArgs.table.target && !!mergedArgs.children.find(childTable => childTable.target === args.target)) {
//         args.options.nullable = true;
//     }
//     return new ColumnMetadata(args);
// });
// const discriminatorValueArgs = mergedArgs.discriminatorValues.find(discriminatorValueArgs => {
//     return discriminatorValueArgs.target === tableArgs.target;
// });
// after all metadatas created we set parent entity metadata for class-table inheritance
// entityMetadatas.forEach(entityMetadata => {
//     const mergedArgs = realTables.find(args => args.target === entityMetadata.target);
//     if (mergedArgs && mergedArgs.parent) {
//         const parentEntityMetadata = entityMetadatas.find(entityMetadata => entityMetadata.target === (mergedArgs!.parent! as any).target); // todo: weird compiler error here, thats why type casing is used
//         if (parentEntityMetadata)
//             entityMetadata.parentEntityMetadata = parentEntityMetadata;
//     }
// });

//# sourceMappingURL=EntityMetadataBuilder.js.map
