# Agility CMS Sync SDK
The Agility CMS Sync SDK provides an interface to sync, store and access content locally.

By keeping a local cache of your content, your web app can access content faster.

## Benefits
- Access your content quickly, and locally in your web or mobile app
- Use your own persistent storage, such as **Gatsby GraphQL**, a **Database**, or **Local Storage**
- Simplify syncing content



## Use Cases
1. You want to reduce the amount of REST API calls made to your Agility CMS instance.
2. You want so synchronize content from the CMS to another system such Redis Cache
3. You are running a **Server-Side Rendered (SSR)** web app and you want to cache your content locally, reducing latency for retrieving content.
4. You are using a **Static Site Generator (SSG)** and you don't want to have to re-source all of your content on each build.
5. You have a client-side **Single Page Application**, and want to cache content in local storage in the browser.

## How it Works
This Sync SDK uses the Sync API `getSyncPages` and `getSyncContent` found in our [Agility CMS Content Fetch JS SDK](https://agilitydocs.netlify.com/agility-content-fetch-js-sdk/) and aims to abstract some of the complexities involved in managing synced content.

It Calls the Sync API and returns content that has not yet been synced. The first call will pull everything and save it to your local store. Subsequent calls will only refresh content that has changed since the last time the Sync API was called.

This SDK:
- Calls the API
- Manages your `syncToken` for you
- Stores content in the filesystem (by default)
- Provides ability to extend and store/access content in other places

## Setup
Install `@agility/content-sync`:
```
npm install @agility/content-sync
```

## Sync to Filesystem (using Defaults)
1. Create a sync client:
    ```javascript
    import agilitySync from '@agility/content-sync'
    const syncClient = agilitySync.getSyncClient({
        //your 'guid' from Agility CMS
        guid: 'some-guid',
        //your 'apiKey' from Agility CMS
        apiKey: 'some-api-key',
        //the language(s) of content you want to source
        languages: ['en-us'],
        //your channel(s) for the pages you want to source
		channels: ['website'],
		//whether you are using the preview key or not
		isPreview: false
    });
    ```

2. Run the `runSync` command to synchronize your Agility CMS content (*Content* and *Pages*) to your local filesystem
    ```javascript
    await syncClient.runSync();
    ```
    `runSync()` will pull down all your *Sitemap*, *Pages*, and *Content* and store them in your local filesystem under the default path `.agility-files`.

## Sync using a Custom Store
While this SDK provides a filesystem sync interface by default, you can change this and use another one or create your own.
```javascript
import agilitySync from '@agility/constent-sync'
import aSampleSyncConsoleInterface from './store-interface-console'
const syncClient = agilitySync.getSyncClient({
    //your 'guid' from Agility CMS
    guid: 'some-guid',
    //your 'apiKey' from Agility CMS
    apiKey: 'some-api-key',
    //the language(s) of content you want to source
    languages: ['en-us'],
    //your channel(s) for the pages you want to source
    channels: ['website'],
    //your custom storage/access interface
    store: {
        //must be the interface used to store and access content
        interface: aSampleSyncConsoleInterface,
        //any options/config that you want to pass along to your interface as an argument 'options'
        options: {}
    }
});
//start the sync process
syncClient.runSync();
```

## Accessing Content
Once content is in your sync store, you can easily access it as you need it:
```javascript
import agilitySync from '@agility/constent-sync'
const syncClient = agilitySync.getSyncClient({
    //your 'guid' from Agility CMS
    guid: 'some-guid',
    //your 'apiKey' from Agility CMS
    apiKey: 'some-api-key',
    //the language(s) of content you want to source
    languages: ['en-us'],
    //your channel(s) for the pages you want to source
    channels: ['website']
});

//start the sync process
await syncClient.runSync();

//query and retrieve your content
const contentItem = await syncClient.store.getContentItem({
    contentID: 21,
    languageCode: languageCode
})

const contentList = await syncClient.store.getContentList({
    referenceName: 'posts',
    languageCode: languageCode
})
```

## Clearing out the Sync Content
To clear out the locally synced content, run the clearSync command.
```javascript
await syncClient.clearSync();
```

## How to Create your Own Sync Store
Create a new `.js` file which exports the following methods:
```javascript
exports.saveItem = async ({ options, item, itemType, languageCode, itemID }) => {
    console.log(`Console Interface: saveItem has been called`);
    return null;
}

exports.deleteItem = async ({ options, itemType, languageCode, itemID }) => {
    console.log(`Console Interface: deleteItem has been called`);
    return null;
}

exports.mergeItemToList = async ({ options, item, languageCode, itemID, referenceName, definitionName }) => {
	console.log(`Console Interface: mergeItemToList has been called`);
    return null;
}

exports.getItem = async ({ options, itemType, languageCode, itemID }) => {
    console.log(`Console Interface: getItem has been called`)
    return null;
}

exports.clearItems = async ({ options }) => {
    console.log(`Console Interface: clearItem has been called`)
    return null;
}
```







