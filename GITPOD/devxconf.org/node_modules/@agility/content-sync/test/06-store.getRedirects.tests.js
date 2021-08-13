import chai from 'chai'
const assert = chai.assert;
const expect = chai.expect;

import { createSyncClient, createPreviewSyncClient } from './_syncClients.config'

/*
    This file contains static references to content from the instance configured in the apiClient.config file.
*/

const languageCode = 'en-us'

describe('store.getUrlRedirections:', async function() {

    it('should be able to retrieve the redirections from the store', async function() {
        var syncClient = createSyncClient();

        const redirections = await syncClient.store.getUrlRedirections({
            languageCode: languageCode
		})

		assert.isArray(redirections.items, 'items should be an array.')
		assert.isBoolean(redirections.isUpToDate, 'isUpToDate should be a boolean.')
    })
});

