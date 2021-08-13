"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MongoDriver_1 = require("../driver/mongodb/MongoDriver");
/**
 * Contains all information about entity's embedded property.
 */
var EmbeddedMetadata = /** @class */ (function () {
    // ---------------------------------------------------------------------
    // Constructor
    // ---------------------------------------------------------------------
    function EmbeddedMetadata(options) {
        /**
         * Columns inside this embed.
         */
        this.columns = [];
        /**
         * Relations inside this embed.
         */
        this.relations = [];
        /**
         * Entity listeners inside this embed.
         */
        this.listeners = [];
        /**
         * Indices applied to the embed columns.
         */
        this.indices = [];
        /**
         * Relation ids inside this embed.
         */
        this.relationIds = [];
        /**
         * Relation counts inside this embed.
         */
        this.relationCounts = [];
        /**
         * Nested embeddable in this embeddable (which has current embedded as parent embedded).
         */
        this.embeddeds = [];
        /**
         * Indicates if this embedded is in array mode.
         *
         * This option works only in monogodb.
         */
        this.isArray = false;
        /**
         * Returns array of property names of current embed and all its parent embeds.
         *
         * example: post[data][information][counters].id where "data", "information" and "counters" are embeds
         * we need to get value of "id" column from the post real entity object.
         * this method will return ["data", "information", "counters"]
         */
        this.parentPropertyNames = [];
        /**
         * Returns array of prefixes of current embed and all its parent embeds.
         */
        this.parentPrefixes = [];
        /**
         * Returns embed metadatas from all levels of the parent tree.
         *
         * example: post[data][information][counters].id where "data", "information" and "counters" are embeds
         * this method will return [embed metadata of data, embed metadata of information, embed metadata of counters]
         */
        this.embeddedMetadataTree = [];
        /**
         * Embed metadatas from all levels of the parent tree.
         *
         * example: post[data][information][counters].id where "data", "information" and "counters" are embeds
         * this method will return [embed metadata of data, embed metadata of information, embed metadata of counters]
         */
        this.columnsFromTree = [];
        /**
         * Relations of this embed and all relations from its child embeds.
         */
        this.relationsFromTree = [];
        /**
         * Relations of this embed and all relations from its child embeds.
         */
        this.listenersFromTree = [];
        /**
         * Indices of this embed and all indices from its child embeds.
         */
        this.indicesFromTree = [];
        /**
         * Relation ids of this embed and all relation ids from its child embeds.
         */
        this.relationIdsFromTree = [];
        /**
         * Relation counts of this embed and all relation counts from its child embeds.
         */
        this.relationCountsFromTree = [];
        this.entityMetadata = options.entityMetadata;
        this.type = options.args.type();
        this.propertyName = options.args.propertyName;
        this.customPrefix = options.args.prefix;
        this.isArray = options.args.isArray;
    }
    // ---------------------------------------------------------------------
    // Public Methods
    // ---------------------------------------------------------------------
    /**
     * Creates a new embedded object.
     */
    EmbeddedMetadata.prototype.create = function () {
        return new this.type;
    };
    // ---------------------------------------------------------------------
    // Builder Methods
    // ---------------------------------------------------------------------
    EmbeddedMetadata.prototype.build = function (connection) {
        this.embeddeds.forEach(function (embedded) { return embedded.build(connection); });
        this.prefix = this.buildPrefix(connection);
        this.parentPropertyNames = this.buildParentPropertyNames();
        this.parentPrefixes = this.buildParentPrefixes();
        this.propertyPath = this.parentPropertyNames.join(".");
        this.embeddedMetadataTree = this.buildEmbeddedMetadataTree();
        this.columnsFromTree = this.buildColumnsFromTree();
        this.relationsFromTree = this.buildRelationsFromTree();
        this.listenersFromTree = this.buildListenersFromTree();
        this.indicesFromTree = this.buildIndicesFromTree();
        this.relationIdsFromTree = this.buildRelationIdsFromTree();
        this.relationCountsFromTree = this.buildRelationCountsFromTree();
        return this;
    };
    // ---------------------------------------------------------------------
    // Protected Methods
    // ---------------------------------------------------------------------
    EmbeddedMetadata.prototype.buildPrefix = function (connection) {
        if (connection.driver instanceof MongoDriver_1.MongoDriver)
            return this.propertyName;
        var prefixes = [];
        if (this.parentEmbeddedMetadata)
            prefixes.push(this.parentEmbeddedMetadata.buildPrefix(connection));
        if (this.customPrefix === undefined) {
            prefixes.push(this.propertyName);
        }
        else if (typeof this.customPrefix === "string") {
            prefixes.push(this.customPrefix);
        }
        return prefixes.join("_"); // todo: use naming strategy instead of "_"  !!!
    };
    EmbeddedMetadata.prototype.buildParentPropertyNames = function () {
        return this.parentEmbeddedMetadata ? this.parentEmbeddedMetadata.buildParentPropertyNames().concat(this.propertyName) : [this.propertyName];
    };
    EmbeddedMetadata.prototype.buildParentPrefixes = function () {
        return [this.prefix || this.propertyName];
    };
    EmbeddedMetadata.prototype.buildEmbeddedMetadataTree = function () {
        return this.parentEmbeddedMetadata ? this.parentEmbeddedMetadata.buildEmbeddedMetadataTree().concat(this) : [this];
    };
    EmbeddedMetadata.prototype.buildColumnsFromTree = function () {
        return this.embeddeds.reduce(function (columns, embedded) { return columns.concat(embedded.buildColumnsFromTree()); }, this.columns);
    };
    EmbeddedMetadata.prototype.buildRelationsFromTree = function () {
        return this.embeddeds.reduce(function (relations, embedded) { return relations.concat(embedded.buildRelationsFromTree()); }, this.relations);
    };
    EmbeddedMetadata.prototype.buildListenersFromTree = function () {
        return this.embeddeds.reduce(function (relations, embedded) { return relations.concat(embedded.buildListenersFromTree()); }, this.listeners);
    };
    EmbeddedMetadata.prototype.buildIndicesFromTree = function () {
        return this.embeddeds.reduce(function (relations, embedded) { return relations.concat(embedded.buildIndicesFromTree()); }, this.indices);
    };
    EmbeddedMetadata.prototype.buildRelationIdsFromTree = function () {
        return this.embeddeds.reduce(function (relations, embedded) { return relations.concat(embedded.buildRelationIdsFromTree()); }, this.relationIds);
    };
    EmbeddedMetadata.prototype.buildRelationCountsFromTree = function () {
        return this.embeddeds.reduce(function (relations, embedded) { return relations.concat(embedded.buildRelationCountsFromTree()); }, this.relationCounts);
    };
    return EmbeddedMetadata;
}());
exports.EmbeddedMetadata = EmbeddedMetadata;

//# sourceMappingURL=EmbeddedMetadata.js.map
