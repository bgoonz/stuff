import agility from '@agility/content-fetch'
import syncContent from './methods/syncContent'
import clearSync from './methods/clearSync'
import syncPages from './methods/syncPages'
import runSync from './methods/runSync'

import storeInterface from './store-interface'
import storeInterfaceFileSystem from './store-interface-filesystem'

function getSyncClient (userConfig) {
    validateConfigParams(userConfig);
    return createSyncCient(userConfig);
}

function validateConfigParams(configParams) {

    if(!configParams.guid || configParams.guid.length == 0) {
        throw new TypeError('You must provide an guid.');
    } else if(!configParams.apiKey || configParams.apiKey.length == 0) {
        throw new TypeError('You must provide an access token.');
    } else {
        return;
    }
}

const defaultConfig = {
    baseUrl: null,
    isPreview: false,
    guid: null,
    apiKey: null,
    languages: [],
    channels: [],
    debug: false,
    store: {
        interface: storeInterfaceFileSystem,
        options: {
            rootPath: '.agility-files'
        }
    }
};

function createSyncCient(userConfig) {
    let config = {
        ...defaultConfig,
        ...userConfig
        
    }

    const agilityClient = agility.getApi({
        guid: config.guid,
        apiKey: config.apiKey,
        isPreview: config.isPreview,
        debug: config.debug,
        baseUrl: config.baseUrl
    });


    //resolve the dependancy for store interface implementation (uses file-system by default)
    let store = config.store.interface;

    //set the sync storage interface provider, it will also validate it
    storeInterface.setStore(store, config.store.options);
    
    return {
        config,
        agilityClient,
        syncContent,
        syncPages,
        clearSync,
        runSync,
        store: storeInterface
    }
}

export default { getSyncClient }