var AssignableDisposable = require('./AssignableDisposable');
var EMPTY_DISPOSABLE = {dispose: function empty() {}};
var mergeJSONGraphEnvelopes = require('./cache/mergeJSONGraphEnvelopes');
var pathUtils = require('falcor-path-utils');
var optimizePathSets = pathUtils.optimizePathSets;
var collapse = pathUtils.collapse;
var MAX_REFERENCES_TO_FOLLOW = 10;

/**
 * Performs the requesting of the data from each dataSource until exhausted
 * or completed.
 * @private
 */
// TODO: Clean up this function as its very large.
module.exports = function getRequestCycle(sources, sourceIndex,
                                          remainingPathsArg, seed,
                                          observer, disposable) {

    var currentSource = sources[sourceIndex];
    var remainingPaths = remainingPathsArg;
    disposable = disposable || new AssignableDisposable();

    // If the source index is greater than 1 then we need to attempt to
    // optimize / reduce remaining paths with our partially complete cache.
    if (sourceIndex > 1 && remainingPaths && remainingPaths.length) {
        remainingPaths = optimizePathSets(seed.jsonGraph, remainingPaths,
                                          MAX_REFERENCES_TO_FOLLOW);
        if (remainingPaths.length) {
            remainingPaths = collapse(remainingPaths);
        }
    }

    // Sources or remaining paths have been exhausted.  Time to onNext /
    // onComplete
    if (!currentSource || !remainingPaths || remainingPaths.length === 0) {
        seed.unhandledPaths = remainingPaths;
        observer.onNext(seed);
        observer.onCompleted();
        disposable.currentDisposable = EMPTY_DISPOSABLE;
        return disposable;
    }

    // Request from the current source.
    var jsonGraphFromSource;
    disposable.currentDisposable = currentSource.
        get(remainingPaths).
        subscribe(
            // An onNext simply just holds onto the value that was given
            // and will perform the merging when complete.
            function onNext(jsonGraphEnvelop) {
                jsonGraphFromSource = jsonGraphEnvelop;
            },

            // This is the case of the catastrophic error.  We are no longer
            // able to recurse on our dataSources.  If there are remaining
            // values / have been onNext'd then we need to merge and report
            // then onError.
            function onError(dataSourceError) {
                // Exit condition.
                if (disposable.disposed) {
                    return;
                }

                // Merge and onNext the seed value to the observer.
                if (sourceIndex > 0 || jsonGraphFromSource) {
                    if (jsonGraphFromSource) {
                        mergeJSONGraphEnvelopes(seed, jsonGraphFromSource);
                    }
                    observer.onNext(seed);
                }

                // Assumes that the array is an array of path values.
                if (Array.isArray(dataSourceError)) {
                    observer.onError(dataSourceError);
                    return;
                }

                observer.onError(remainingPaths.map(function toPV(path) {
                    return {
                        path: path,
                        value: dataSourceError
                    };
                }));
            },

            // We have completed successfully.  Whatever has been onNext should
            // be merged into the envelope.  If there are unhandledPaths then
            // we need to recurse, else onNext / onCompleted.
            function onCompleted() {
                // Exit condition.
                if (disposable.disposed) {
                    return;
                }

                // We need to merge the results into our seed, if the source
                // is the second or later source.
                if (sourceIndex === 0) {
                    seed = {
                        jsonGraph: jsonGraphFromSource.jsonGraph
                    };
                }

                else {
                    mergeJSONGraphEnvelopes(seed, jsonGraphFromSource);
                }

                // are there unhandledPaths?
                var unhandledPaths = jsonGraphFromSource.unhandledPaths;
                if (unhandledPaths && unhandledPaths.length) {

                    // Async Request Recursion.
                    getRequestCycle(sources, sourceIndex + 1, unhandledPaths,
                                    seed, observer, disposable);
                }

                // We have finished here.
                else {
                    observer.onNext(seed);
                    observer.onCompleted();
                }
            });


    return disposable;
};
