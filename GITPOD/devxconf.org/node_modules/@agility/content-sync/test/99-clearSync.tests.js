import chai from 'chai'
const assert = chai.assert;
const expect = chai.expect;

import { createSyncClient, createPreviewSyncClient } from './_syncClients.config'

/*
    This file contains static references to content from the instance configured in the apiClient.config file.
*/


const languageCode = 'en-us'
describe('clearSync:', async function() {

    it('should run the clear sync method which should remove local files', async function() {
		var sync = createSyncClient();

        await sync.clearSync();

        //test items are no longer there
        const contentItem = await sync.store.getContentItem({
            contentID: 21,
            languageCode: languageCode
        })
        assert.strictEqual(contentItem, null, 'item that should be there is no longer there')
    })

});

