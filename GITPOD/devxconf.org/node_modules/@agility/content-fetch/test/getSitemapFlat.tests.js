import chai from 'chai'
const assert = chai.assert;
const expect = chai.expect;

import { createApiClient, createPreviewApiClient, createCatchedApiClient } from './apiClients.config'

/* 
    This file contains static references to content from the instance configured in the apiClient.config file.
*/


/* GET SITEMAP FLAT ***********************************************/
describe('getSitemapFlat:', function() {

    this.timeout('120s');

    it('should retrieve a sitemap in a flat format in live mode', function(done) {
        var api = createApiClient();
        api.getSitemapFlat({
            channelName: 'website',
            languageCode: 'en-us'
        })
        .then(function(sitemap) {
            assert.strictEqual(sitemap['/home'].pageID, 2);
            done();
        })
        .catch(done);
    })
    
    it('should retrieve a sitemap in a flat format in preview mode', function(done) {
        var api = createPreviewApiClient();
        api.getSitemapFlat({
            channelName: 'website',
            languageCode: 'en-us'
        })
        .then(function(sitemap) {
            assert.strictEqual(sitemap['/home'].pageID, 2);
            done();
        })
        .catch(done);
    })
    
    it('should throw error if channelName not passed as argument for getSitemapFlat', function(done) {
        expect(function() {
            var api = createApiClient();
            api.getSitemapFlat({
                someOtherParam: 1,
                languageCode: 'en-us'
            })
            .then(function(sitemap) {
                assert.strictEqual(sitemap['/home'].pageID, 2);
                done();
            })
            .catch(done);
        }).to.throw( TypeError );
        done();
    })
    
    it('should throw error if languageCode not passed as argument for getSitemapFlat', function(done) {
        expect(function() {
            var api = createApiClient();
            api.getSitemapFlat({
                channelName: 'website'
            })
            .then(function(sitemap) {
                assert.strictEqual(sitemap['/home'].pageID, 2);
                done();
            })
            .catch(done);
        }).to.throw( TypeError );
        done();
    })
})
