//import agilitySync from '../dist/agility-sync-sdk.node'
import agilitySync from '../src/sync-client'

import storeInterfaceConsole from '../src/store-interface-console'

// Agility Instance = 'Headless Integration Testing' [Dev]
const guid = 'c741222b-1080-45f6-9a7f-982381c5a485';
const apiKeyFetch = 'UnitTestsFetch.2ace650991363fbcffa6776d411d1b0d616b8e3424ce842b81cba7af0039197e';
const apiKeyPreview = 'UnitTestsPreview.69e6bca345ced0b7ca5ab358b351ea5c870790a5945c25d749a865332906b124';


function createSyncClient() {
    var syncClient = agilitySync.getSyncClient({
        guid: guid,
        apiKey: apiKeyFetch,
        isPreview: false,
        channels: [ 'website'],
		languages: ['en-us']
	});

    return syncClient;
}

function createSyncClientUsingConsoleStore() {
    var syncClient = agilitySync.getSyncClient({
        guid: guid,
        apiKey: apiKeyFetch,
        isPreview: false,
        channels: [ 'website'],
        languages: ['en-us'],
        store: {
            interface: storeInterfaceConsole,
            options: {}
        }
    });
    return syncClient;
}


function createPreviewSyncClient() {
    var syncClient = agilitySync.getSyncClient({
        guid: guid,
        apiKey: apiKeyPreview,
        isPreview: true,
        channels: [ 'website'],
        languages: ['en-us']
    });
    return syncClient;
}

export {
    createSyncClient,
    createSyncClientUsingConsoleStore,
    createPreviewSyncClient
}