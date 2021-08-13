import chai from 'chai'
const assert = chai.assert;

import agilitySync from '../src/sync-client'
import { createSyncClientUsingConsoleStore } from './_syncClients.config'


//This is a synchronous test
describe('getSyncClient:', function() {

    this.timeout('120s');
    
    it('should return a sync worker object with required params', function(done) {
        const syncClient = agilitySync.getSyncClient({
            guid: 'some-guid',
            apiKey: 'some-access-token'
        });
        assert.strictEqual(typeof(syncClient), "object");
        done();
    })

    it('should return an sync worker object in preview mode', function(done) {
        const syncClient = agilitySync.getSyncClient({
            guid: 'some-guid',
            apiKey: 'some-access-token',
            isPreview: true
        });

        assert.strictEqual(syncClient.config.isPreview, true);
        done();
    })

    it('should validate a valid external store interface (console)', function(done) {
        const syncClient = createSyncClientUsingConsoleStore()    
        done();
    })
 
});