import chai from 'chai'
const assert = chai.assert;
const expect = chai.expect;

import { createApiClient, createPreviewApiClient, createCatchedApiClient } from './apiClients.config'

/* 
    This file contains static references to content from the instance configured in the apiClient.config file.
*/


/* GET SITEMAP NESTED **************************************************/
describe('getSitemapNested:', function() {

    this.timeout('120s');

    it('should retrieve a sitemap in a nested format in live mode', function(done) {
        var api = createApiClient();
        api.getSitemapNested({
            channelName: 'website',
            languageCode: 'en-us'
        })
        .then(function(sitemap) {
            assert.strictEqual(sitemap[0].pageID, 2);
            done();
        })
        .catch(done);
    })
    
    it('should retrieve a sitemap in a nested format in preview mode', function(done) {
        var api = createPreviewApiClient();
        api.getSitemapNested({
            channelName: 'website',
            languageCode: 'en-us'
        })
        .then(function(sitemap) {
            assert.strictEqual(sitemap[0].pageID, 2);
            done();
        })
        .catch(done);
    })
    
    it('should throw error if channelName not passed as argument for getSitemapNested', function(done) {
        expect(function() {
            var api = createApiClient();
            api.getSitemapNested({
                someOtherParam: 1,
                languageCode: 'en-us'
            })
            .then(function(sitemap) {
                assert.strictEqual(sitemap[0].pageID, 2);
                done();
            })
            .catch(done);
        }).to.throw( TypeError );
        done();
    })
    
    it('should throw error if languageCode not passed as argument for getSitemapNested', function(done) {
        expect(function() {
            var api = createApiClient();
            api.getSitemapNested({
                channelName: 'website'
            })
            .then(function(sitemap) {
                assert.strictEqual(sitemap[0].pageID, 2);
                done();
            })
            .catch(done);
        }).to.throw( TypeError );
        done();
    })
})
