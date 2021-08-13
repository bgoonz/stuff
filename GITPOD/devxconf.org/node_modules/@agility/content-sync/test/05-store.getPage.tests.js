import chai from 'chai'
const assert = chai.assert;
const expect = chai.expect;

import { createSyncClient, createPreviewSyncClient } from './_syncClients.config'

/* 
    This file contains static references to content from the instance configured in the apiClient.config file.
*/

const languageCode = 'en-us'

describe('store.getPage:', async function() {

    it('should be able to retrieve a page from the store', async function() {
        var syncClient = createSyncClient();

        const page = await syncClient.store.getPage({
            pageID: 2,
            languageCode: languageCode
        })
        assert.strictEqual(page.pageID, 2, 'retrieved the page we asked for')
    })
});

