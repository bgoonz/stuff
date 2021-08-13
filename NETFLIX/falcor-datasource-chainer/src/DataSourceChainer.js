var getRequestCycle = require('./getRequestCycle');
var Subscribable = require('./Subscribable');
var AtLeastOneDataSourceError = require('./errors/AtLeastOneDataSourceError');

/**
 * DataSourceChainer takes in a list of dataSources and calls them one at a time
 * until the get/set/call operation has been satisified.  If the list of sources
 * have been exhausted, then the source will either emit the JSONGraphEnvelope
 * with unhandledPaths key or forward on 'function does not exist' error (call
 * only).
 *
 * The order of dataSource calling is list ordering. The interface can be found
 * here: http://netflix.github.io/falcor/doc/DataSource.html
 *
 * @param {Array.<DataSource>} sources - The list of sources to call.
 * @augments DataSource
 * @public
 */
var DataSourceChainer = function DataSourceChainer(sources) {
    // There has to be at least one dataSource.
    if (!sources || sources.length === 0) {
        throw new AtLeastOneDataSourceError();
    }
    this._sources = sources;
};

DataSourceChainer.prototype = {
    /**
     * A get response is considered _completed_ based on the following three
     * conditions:
     * - The unhandledPaths key is empty or non-existent.
     * - The chain of dataSources have been exhausted.
     * - There was an `onError` from the dataSource.  We no longer have the
     *   context for chaining.  An onError from a dataSource is a catastrophic
     *   error, not an error within the dataSource's jsonGraphEnvelope
     *   (imagine a 500 from the HttpDataSource).
     * @param {Array.<Path>} paths -
     */
    get: function get(paths) {
        var self = this;
        return new Subscribable(function getSubscribe(observer) {
            var seed = {
                jsonGraph: {}
            };

            // Performs the internal get request loop.
            return getRequestCycle(self._sources, 0,
                                   paths, seed, observer);
        });
    },

    /**
     * Set will simply pass through the set command to the first dataSource
     * in the chain.
     * @param {JSONGraphEnvelope} jsonGraph -
     */
    set: function set(jsonGraph) {
        var source = this._sources[0];
        return source.set(jsonGraph);
    },

    call: function call(callPath, args, suffixes, paths) {
    }
};

module.exports = DataSourceChainer;
