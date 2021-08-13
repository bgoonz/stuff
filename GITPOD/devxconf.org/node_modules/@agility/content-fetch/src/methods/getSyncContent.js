import { buildRequestUrlPath, buildAuthHeader } from '../utils'

/**
 * Retrieves a list of content items that need to be synced based on the provided sync content items token, and returns the next sync token.
 * @memberof AgilityFetch.Client.Sync
 * @param {Object} requestParams - The paramters for the API request.
 * @param {number} requestParams.syncToken - The sync token provided in the response to a previous sync API call. To start a new sync, use the value of '0'.
 * @param {string} requestParams.languageCode - The language code of the content you want to retrieve.
 * @param {number} [requestParams.pageSize] - The number of items to return back with each call.  Default is 500.
 * @returns {Promise<AgilityFetch.Types.SyncContent>} - Returns a list of content item objects.
 * @example
 * 
 * import agility from '@agility/content-fetch'
 * 
 * const api = agility.getApi({
 *   guid: 'ade6cf3c',
 *   apiKey: 'defaultlive.201ffdd0841cacad5bb647e76547e918b0c9ecdb8b5ddb3cf92e9a79b03623cb',
 * });
 * 
 * api.getSyncContent({
 *      syncToken: '0', //to start a new sync
 *      languageCode: 'en-us',
 *      pageSize: 500
 * })
 * .then(function(contentList) {
 *      console.log(contentList.items);
 * 
 *      //the next sync token to use, continue to call this method (loop) until no sync token is provided in the response. This indicates your are up to date.
 *      console.log(contentList.syncToken); 
 * })
 * .catch(function(error) {
 *      console.log(error);
 * });
*/
function getSyncContent(requestParams) {

    validateRequestParams(requestParams);

    const req = {
        url: `/sync/items?pageSize=${requestParams.pageSize}&syncToken=${requestParams.syncToken}`,
        method: 'get',
        baseURL: buildRequestUrlPath(this.config, requestParams.languageCode),
        headers: buildAuthHeader(this.config),
        params: {}
    };

    return this.makeRequest(req);
}

function validateRequestParams(requestParams) {
    if (!requestParams.languageCode) {
        throw new TypeError('You must include a languageCode in your request params.')
    }
    else if (requestParams.syncToken == undefined || requestParams.syncToken == null) {
        throw new TypeError('You must include a syncToken value your request params.  Use zero (0) to start a new sync.');
    } else {
        return;
    }
}


export default getSyncContent;
