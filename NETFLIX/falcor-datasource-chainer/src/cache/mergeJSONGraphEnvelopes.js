// Merges the jsonGraphEnvelopes.
function mergeJSONGraphEnvelopes(jsonGraphCache, incomingJSONGraphEnvelope) {
    mergeJSONGraph(jsonGraphCache.jsonGraph,
                   incomingJSONGraphEnvelope.jsonGraph);

    // NOTE: No need to copy paths because "paths" do not need to exist on
    // dataSource responses.
}

function mergeJSONGraph(jsonGraphToMergeInto, cacheToMergeFrom,
                   fromParentCache, fromKey) {


    // The base case is when the current cache position is a leaf node.  Which
    // is a non object / null or there is a $type key.
    if (cacheToMergeFrom.$type ||
        typeof cacheToMergeFrom !== 'object' ||
        cacheToMergeFrom === null) {

        fromParentCache[fromKey] = cacheToMergeFrom;
        return;
    }


    // Inductive case: iterate on all the keys and perform a simple merge.
    var keys = Object.keys(cacheToMergeFrom);
    var i, len;

    for (i = 0, len = keys.length; i < len; ++i) {
        var key = keys[i];
        if (!jsonGraphToMergeInto[key]) {
            jsonGraphToMergeInto[key] = {};
        }

        mergeJSONGraph(jsonGraphToMergeInto[key], cacheToMergeFrom[key],
                       jsonGraphToMergeInto, key);
    }
}

module.exports = mergeJSONGraphEnvelopes;
