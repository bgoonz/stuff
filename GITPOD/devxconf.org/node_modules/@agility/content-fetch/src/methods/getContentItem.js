import { buildRequestUrlPath, buildAuthHeader } from '../utils'

/**
 * Gets the details of a content item by their Content ID.
 * @memberof AgilityFetch.Client.Content
 * @param {Object} requestParams - The paramters for the API request.
 * @param {number} requestParams.contentID - The contentID of the requested item in this language.
 * @param {string} requestParams.languageCode - The language code of the content you want to retrieve.
 * @param {number} [requestParams.contentLinkDepth] - The depth, representing the levels in which you want linked content auto-resolved. Default is **1**.
 * @param {boolean} [requestParams.expandAllContentLinks] - Whether or not to expand entire linked content references, includings lists and items that are rendered in the CMS as Grid or Link. Default is **false**
 * @returns {Promise<AgilityFetch.Types.ContentItem>} - Returns a content item object.
 * @example
 *
 * import agility from '@agility/content-fetch'
 *
 * const api = agility.getApi({
 *   guid: 'ade6cf3c',
 *   apiKey: 'defaultlive.201ffdd0841cacad5bb647e76547e918b0c9ecdb8b5ddb3cf92e9a79b03623cb',
 * });
 *
 * api.getContentItem({
 *     contentID: 22,
 *     languageCode: 'en-us'
 * })
 * .then(function(contentItem) {
 *     console.log(contentItem);
 * })
 * .catch(function(error) {
 *     console.log(error);
 * });
 *
*/
function getContentItem(requestParams) {

    validateRequestParams(requestParams);

    //merge default params with request params
    requestParams = {...defaultParams, ...requestParams};

    const req = {
        url: `/item/${requestParams.contentID}?contentLinkDepth=${requestParams.contentLinkDepth}&expandAllContentLinks=${requestParams.expandAllContentLinks}`,
        method: 'get',
        baseURL: buildRequestUrlPath(this.config, requestParams.languageCode),
        headers: buildAuthHeader(this.config),
		params:{}
    };

    return this.makeRequest(req);
}

function validateRequestParams(requestParams) {
    if(!requestParams.languageCode) {
        throw new TypeError('You must include a languageCode in your request params.')
    }
    else if(!requestParams.contentID) {
        throw new TypeError('You must include a contentID number in your request params.');
    } else if(requestParams.contentLinkDepth && (isNaN(requestParams.contentLinkDepth) || requestParams.contentLinkDepth < 0)) {
        throw new TypeError('When specifying contentLinkDepth, it must be a number greater than 0.');
    } else  if(requestParams.expandAllContentLinks && typeof requestParams.expandAllContentLinks !== 'boolean') {
        throw new TypeError('ExpandAllContentLinks parameter must be a value of true or false');
    } else {
        return;
    }
}

const defaultParams = {
    contentLinkDepth: 1,
    expandAllContentLinks: false
}

export default getContentItem;
