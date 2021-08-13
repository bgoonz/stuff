"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Wraps entities and creates getters/setters for their relations
 * to be able to lazily load relations when accessing these relations.
 */
var RelationLoader = /** @class */ (function () {
    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    function RelationLoader(connection) {
        this.connection = connection;
    }
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    /**
     * Loads relation data for the given entity and its relation.
     */
    RelationLoader.prototype.load = function (relation, entity) {
        if (relation.isManyToOne || relation.isOneToOneOwner) {
            return this.loadManyToOneOrOneToOneOwner(relation, entity);
        }
        else if (relation.isOneToMany || relation.isOneToOneNotOwner) {
            return this.loadOneToManyOrOneToOneNotOwner(relation, entity);
        }
        else if (relation.isManyToManyOwner) {
            return this.loadManyToManyOwner(relation, entity);
        }
        else { // many-to-many non owner
            return this.loadManyToManyNotOwner(relation, entity);
        }
    };
    /**
     * Loads data for many-to-one and one-to-one owner relations.
     *
     * (ow) post.category<=>category.post
     * loaded: category from post
     * example: SELECT category.id AS category_id, category.name AS category_name FROM category category
     *              INNER JOIN post Post ON Post.category=category.id WHERE Post.id=1
     */
    RelationLoader.prototype.loadManyToOneOrOneToOneOwner = function (relation, entity) {
        var primaryColumns = relation.entityMetadata.primaryColumns;
        var joinColumns = relation.isOwning ? relation.joinColumns : relation.inverseRelation.joinColumns;
        var conditions = joinColumns.map(function (joinColumn) {
            return relation.entityMetadata.name + "." + relation.propertyName + " = " + relation.propertyName + "." + joinColumn.referencedColumn.propertyName;
        }).join(" AND ");
        var qb = this.connection
            .createQueryBuilder()
            .select(relation.propertyName) // category
            .from(relation.type, relation.propertyName) // Category, category
            .innerJoin(relation.entityMetadata.target, relation.entityMetadata.name, conditions);
        primaryColumns.forEach(function (primaryColumn) {
            qb.andWhere(relation.entityMetadata.name + "." + primaryColumn.propertyPath + " = :" + primaryColumn.propertyName)
                .setParameter("" + primaryColumn.propertyName, primaryColumn.getEntityValue(entity));
        });
        return qb.getOne();
    };
    /**
     * Loads data for one-to-many and one-to-one not owner relations.
     *
     * SELECT post
     * FROM post post
     * WHERE post.[joinColumn.name] = entity[joinColumn.referencedColumn]
     */
    RelationLoader.prototype.loadOneToManyOrOneToOneNotOwner = function (relation, entity) {
        var qb = this.connection
            .createQueryBuilder()
            .select(relation.propertyName)
            .from(relation.inverseRelation.entityMetadata.target, relation.propertyName);
        relation.inverseRelation.joinColumns.forEach(function (joinColumn) {
            qb.andWhere(relation.propertyName + "." + joinColumn.propertyName + " = :" + joinColumn.referencedColumn.propertyName)
                .setParameter("" + joinColumn.referencedColumn.propertyName, joinColumn.referencedColumn.getEntityValue(entity));
        });
        return relation.isOneToMany ? qb.getMany() : qb.getOne();
    };
    /**
     * Loads data for many-to-many owner relations.
     *
     * SELECT category
     * FROM category category
     * INNER JOIN post_categories post_categories
     * ON post_categories.postId = :postId
     * AND post_categories.categoryId = category.id
     */
    RelationLoader.prototype.loadManyToManyOwner = function (relation, entity) {
        var mainAlias = relation.propertyName;
        var joinAlias = relation.junctionEntityMetadata.tableName;
        var joinColumnConditions = relation.joinColumns.map(function (joinColumn) {
            return joinAlias + "." + joinColumn.propertyName + " = :" + joinColumn.propertyName;
        });
        var inverseJoinColumnConditions = relation.inverseJoinColumns.map(function (inverseJoinColumn) {
            return joinAlias + "." + inverseJoinColumn.propertyName + "=" + mainAlias + "." + inverseJoinColumn.referencedColumn.propertyName;
        });
        var parameters = relation.joinColumns.reduce(function (parameters, joinColumn) {
            parameters[joinColumn.propertyName] = joinColumn.referencedColumn.getEntityValue(entity);
            return parameters;
        }, {});
        return this.connection
            .createQueryBuilder()
            .select(mainAlias)
            .from(relation.type, mainAlias)
            .innerJoin(joinAlias, joinAlias, joinColumnConditions.concat(inverseJoinColumnConditions).join(" AND "))
            .setParameters(parameters)
            .getMany();
    };
    /**
     * Loads data for many-to-many not owner relations.
     *
     * SELECT post
     * FROM post post
     * INNER JOIN post_categories post_categories
     * ON post_categories.postId = post.id
     * AND post_categories.categoryId = post_categories.categoryId
     */
    RelationLoader.prototype.loadManyToManyNotOwner = function (relation, entity) {
        var mainAlias = relation.propertyName;
        var joinAlias = relation.junctionEntityMetadata.tableName;
        var joinColumnConditions = relation.inverseRelation.joinColumns.map(function (joinColumn) {
            return joinAlias + "." + joinColumn.propertyName + " = " + mainAlias + "." + joinColumn.referencedColumn.propertyName;
        });
        var inverseJoinColumnConditions = relation.inverseRelation.inverseJoinColumns.map(function (inverseJoinColumn) {
            return joinAlias + "." + inverseJoinColumn.propertyName + " = :" + inverseJoinColumn.propertyName;
        });
        var parameters = relation.inverseRelation.inverseJoinColumns.reduce(function (parameters, joinColumn) {
            parameters[joinColumn.propertyName] = joinColumn.referencedColumn.getEntityValue(entity);
            return parameters;
        }, {});
        return this.connection
            .createQueryBuilder()
            .select(mainAlias)
            .from(relation.type, mainAlias)
            .innerJoin(joinAlias, joinAlias, joinColumnConditions.concat(inverseJoinColumnConditions).join(" AND "))
            .setParameters(parameters)
            .getMany();
    };
    return RelationLoader;
}());
exports.RelationLoader = RelationLoader;

//# sourceMappingURL=RelationLoader.js.map
