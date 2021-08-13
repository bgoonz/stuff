/**
 * Utils used to work with EntityMetadata objects.
 */
var EntityMetadataUtils = /** @class */ (function () {
    function EntityMetadataUtils() {
    }
    /**
     * Creates a property paths for a given entity.
     */
    EntityMetadataUtils.createPropertyPath = function (metadata, entity, prefix) {
        var _this = this;
        if (prefix === void 0) { prefix = ""; }
        var paths = [];
        Object.keys(entity).forEach(function (key) {
            // check for function is needed in the cases when createPropertyPath used on values containing a function as a value
            // example: .update().set({ name: () => `SUBSTR('', 1, 2)` })
            var parentPath = prefix ? prefix + "." + key : key;
            if (metadata.hasEmbeddedWithPropertyPath(parentPath)) {
                var subPaths = _this.createPropertyPath(metadata, entity[key], key);
                paths.push.apply(paths, subPaths);
            }
            else {
                var path = prefix ? prefix + "." + key : key;
                paths.push(path);
            }
        });
        return paths;
    };
    /**
     * Creates a property paths for a given entity.
     */
    EntityMetadataUtils.getPropertyPathValue = function (entity, propertyPath) {
        var properties = propertyPath.split(".");
        var recursive = function (object) {
            var propertyName = properties.shift();
            var value = propertyName ? object[propertyName] : object;
            if (properties.length)
                return recursive(value);
            return value;
        };
        return recursive(entity);
    };
    return EntityMetadataUtils;
}());
export { EntityMetadataUtils };

//# sourceMappingURL=EntityMetadataUtils.js.map
