"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DirectoryExportedClassesLoader_1 = require("../util/DirectoryExportedClassesLoader");
var OrmUtils_1 = require("../util/OrmUtils");
var container_1 = require("../container");
var index_1 = require("../index");
var EntityMetadataBuilder_1 = require("../metadata-builder/EntityMetadataBuilder");
var EntitySchemaTransformer_1 = require("../entity-schema/EntitySchemaTransformer");
/**
 * Builds migration instances, subscriber instances and entity metadatas for the given classes.
 */
var ConnectionMetadataBuilder = /** @class */ (function () {
    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    function ConnectionMetadataBuilder(connection) {
        this.connection = connection;
    }
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    /**
     * Builds migration instances for the given classes or directories.
     */
    ConnectionMetadataBuilder.prototype.buildMigrations = function (migrations) {
        var _a = OrmUtils_1.OrmUtils.splitClassesAndStrings(migrations), migrationClasses = _a[0], migrationDirectories = _a[1];
        var allMigrationClasses = migrationClasses.concat(DirectoryExportedClassesLoader_1.importClassesFromDirectories(migrationDirectories));
        return allMigrationClasses.map(function (migrationClass) { return container_1.getFromContainer(migrationClass); });
    };
    /**
     * Builds subscriber instances for the given classes or directories.
     */
    ConnectionMetadataBuilder.prototype.buildSubscribers = function (subscribers) {
        var _a = OrmUtils_1.OrmUtils.splitClassesAndStrings(subscribers || []), subscriberClasses = _a[0], subscriberDirectories = _a[1];
        var allSubscriberClasses = subscriberClasses.concat(DirectoryExportedClassesLoader_1.importClassesFromDirectories(subscriberDirectories));
        return index_1.getMetadataArgsStorage()
            .filterSubscribers(allSubscriberClasses)
            .map(function (metadata) { return container_1.getFromContainer(metadata.target); });
    };
    /**
     * Builds entity metadatas for the given classes or directories.
     */
    ConnectionMetadataBuilder.prototype.buildEntityMetadatas = function (entities, schemas) {
        var _a = OrmUtils_1.OrmUtils.splitClassesAndStrings(entities || []), entityClasses = _a[0], entityDirectories = _a[1];
        var allEntityClasses = entityClasses.concat(DirectoryExportedClassesLoader_1.importClassesFromDirectories(entityDirectories));
        var decoratorEntityMetadatas = new EntityMetadataBuilder_1.EntityMetadataBuilder(this.connection, index_1.getMetadataArgsStorage()).build(allEntityClasses);
        var _b = OrmUtils_1.OrmUtils.splitClassesAndStrings(schemas || []), entitySchemaClasses = _b[0], entitySchemaDirectories = _b[1];
        var allEntitySchemaClasses = entitySchemaClasses.concat(DirectoryExportedClassesLoader_1.importJsonsFromDirectories(entitySchemaDirectories));
        var metadataArgsStorageFromSchema = new EntitySchemaTransformer_1.EntitySchemaTransformer().transform(allEntitySchemaClasses);
        var schemaEntityMetadatas = new EntityMetadataBuilder_1.EntityMetadataBuilder(this.connection, metadataArgsStorageFromSchema).build();
        return decoratorEntityMetadatas.concat(schemaEntityMetadatas);
    };
    return ConnectionMetadataBuilder;
}());
exports.ConnectionMetadataBuilder = ConnectionMetadataBuilder;

//# sourceMappingURL=ConnectionMetadataBuilder.js.map
