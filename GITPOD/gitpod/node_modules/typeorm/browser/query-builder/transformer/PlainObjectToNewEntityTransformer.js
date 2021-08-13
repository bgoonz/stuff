/**
 * Transforms plain old javascript object
 * Entity is constructed based on its entity metadata.
 */
var PlainObjectToNewEntityTransformer = /** @class */ (function () {
    function PlainObjectToNewEntityTransformer() {
    }
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    PlainObjectToNewEntityTransformer.prototype.transform = function (newEntity, object, metadata) {
        this.groupAndTransform(newEntity, object, metadata);
        return newEntity;
    };
    // -------------------------------------------------------------------------
    // Private Methods
    // -------------------------------------------------------------------------
    /**
     * Since db returns a duplicated rows of the data where accuracies of the same object can be duplicated
     * we need to group our result and we must have some unique id (primary key in our case)
     */
    PlainObjectToNewEntityTransformer.prototype.groupAndTransform = function (entity, object, metadata) {
        var _this = this;
        // copy regular column properties from the given object
        metadata.columns
            .filter(function (column) { return object.hasOwnProperty(column.propertyName); })
            .forEach(function (column) { return entity[column.propertyName] = object[column.propertyName]; }); // todo: also need to be sure that type is correct
        // if relation is loaded then go into it recursively and transform its values too
        metadata.relations
            .filter(function (relation) { return object.hasOwnProperty(relation.propertyName); })
            .forEach(function (relation) {
            var relationMetadata = relation.inverseEntityMetadata;
            if (!relationMetadata)
                throw new Error("Relation metadata for the relation " + metadata.name + "#" + relation.propertyName + " is missing");
            if (relation.isManyToMany || relation.isOneToMany) {
                if (object[relation.propertyName] instanceof Array) {
                    entity[relation.propertyName] = object[relation.propertyName].map(function (subObject) {
                        var subEntity = relationMetadata.create();
                        // todo: support custom initial fields here
                        if (entity[relation.propertyName] instanceof Array) {
                            var existRelation = entity[relation.propertyName].find(function (subEntity) {
                                return subEntity[relation.propertyName] === subObject[relation.propertyName];
                            });
                            if (existRelation)
                                _this.groupAndTransform(subEntity, existRelation, relationMetadata);
                        }
                        _this.groupAndTransform(subEntity, subObject, relationMetadata);
                        return subEntity;
                    });
                }
                else {
                    entity[relation.propertyName] = object[relation.propertyName];
                }
            }
            else {
                if (object[relation.propertyName]) {
                    var subEntity = relationMetadata.create();
                    if (entity[relation.propertyName])
                        _this.groupAndTransform(subEntity, entity[relation.propertyName], relationMetadata);
                    _this.groupAndTransform(subEntity, object[relation.propertyName], relationMetadata);
                    entity[relation.propertyName] = subEntity;
                }
                else {
                    entity[relation.propertyName] = object[relation.propertyName];
                }
            }
        });
    };
    return PlainObjectToNewEntityTransformer;
}());
export { PlainObjectToNewEntityTransformer };

//# sourceMappingURL=PlainObjectToNewEntityTransformer.js.map
