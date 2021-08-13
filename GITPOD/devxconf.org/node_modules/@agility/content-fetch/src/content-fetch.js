/**
 * Agility Fetch API JS SDK for retrieving content from the Agility CMS
 * @namespace AgilityFetch
 */

/**
 * Agility Fetch API JS SDK client for Agility CMS
 * @namespace AgilityFetch.Client
 */


 /**
 * Agility Fetch API JS SDK for retrieving content from the Agility CMS
 * @namespace AgilityFetch.Client.Content
 */

  /**
 * Agility Fetch API JS SDK for retrieving pages from the Agility CMS
 * @namespace AgilityFetch.Client.Pages
 */

   /**
 * Agility Fetch API JS SDK for retrieving media from the Agility CMS
 * @namespace AgilityFetch.Client.Media
 */


  /**
 * Agility Fetch API JS SDK for synchronizing content from Agility CMS
 * @namespace AgilityFetch.Client.Sync
 */


/**
 * Types returned by the the Fetch API
 * @namespace AgilityFetch.Types
 */


import createClient from './api-client'
import { isHttps } from './utils'

/**
 * How to create an instance of an an API client for the Agility Content Fetch REST API.
 * @func
 * @name getApi
 * @memberof AgilityFetch
 * @param {Object} config - API intialization params.
 * @param {string} config.guid - The guid that represents your instance.
 * @param {string} config.apiKey - The secret token that represents your application.
 * @param {boolean} [config.isPreview] - If your access token is for preview, then set this to true.
 * @param {Object} [config.caching] - Optional Caching options. Caching is disabled by default.
 * @param {number} [config.caching.maxAge] - In miliseconds. Default value is *0* (disabled). Recommeded value is *180000* (3 mins). Requests are cached in memory only (node or browser).
 * @param {string} [config.baseUrl] - Optionally override the default API Base Url.
 * @return {AgilityFetch.Client}
 * @example
 *
 * import agility from '@agility/content-fetch'
 *
 * const api = agility.getApi({
 *   guid: '191309ca-e675-4be2-bb29-351879528707',
 *   apiKey: 'aGd13M.fa30c36e553a36f871860407e902da9a7375322457acd6bcda038e60af699411',
 *   isPreview: false
 * });
 */

function getApi(config) {
    validateConfigParams(config);
    return createClient(config);
}

function validateConfigParams(configParams) {

    if(!configParams.guid || configParams.guid.length == 0) {
        throw new TypeError('You must provide an guid.');
    } else if(!configParams.apiKey || configParams.apiKey.length == 0) {
        throw new TypeError('You must provide an access token.');
    } else if(configParams.caching && isNaN(configParams.caching.maxAge)) {
        throw new TypeError('When specifying a cache maxAge, you must set a number value in miliseconds, i.e. 180000 (3 mins).');
    } else if(configParams.baseUrl && !isHttps(configParams.baseUrl)) {
        throw new TypeError(`When specifying a baseUrl (${configParams.baseUrl}), it must be over HTTPs.`);
    } else {
        return;
    }
}


export default {
    getApi
};