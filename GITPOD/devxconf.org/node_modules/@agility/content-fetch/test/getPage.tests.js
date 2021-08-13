import chai from 'chai'
const assert = chai.assert;
const expect = chai.expect;

import { createApiClient, createPreviewApiClient, createCatchedApiClient } from './apiClients.config'

/* 
    This file contains static references to content from the instance configured in the apiClient.config file.
*/

 
 
 /* GET PAGE *********************************************************/

 
 describe('getPage:', function() {

    this.timeout('120s');

    it('should retrieve a page in live mode', function(done) {
        var api = createApiClient();
        api.getPage({
            pageID: 2,
            languageCode: 'en-us'
        })
        .then(function(page) {
            assert.strictEqual(page.pageID, 2);
            done();
        })
        .catch(done);
    })
    
    it('should retrieve a page in preview mode', function(done) {
        var api = createPreviewApiClient();
        api.getPage({
            pageID: 2,
            languageCode: 'en-us'
        })
        .then(function(page) {
            assert.strictEqual(page.pageID, 2);
            done();
        })
        .catch(done);
    })
    
    it('should throw error if pageID not passed as argument for getPage', function(done) {
        expect(function() {
            var api = createApiClient();
            api.getPage({
                someOtherParam: 1,
                languageCode: 'en-us'
            })
            .then(function(page) {
                assert.strictEqual(page.pageID, 2);
                done();
            })
            .catch(done);
        }).to.throw( TypeError );
        done();
    })
    
    it('should throw error if languageCode not passed as argument for getPage', function(done) {
        expect(function() {
            var api = createApiClient();
            api.getPage({
                pageID: 1
            })
            .then(function(page) {
                assert.strictEqual(page.pageID, 2);
                done();
            })
            .catch(done);
        }).to.throw( TypeError );
        done();
    })

    it('should retrieve a page and expand all content links when expandAllContentLink is set to true', function(done) {
        var api = createApiClient();
        api.getPage({
            pageID: 2,
            languageCode: 'en-us',
            expandAllContentLinks: true
        })
        .then(function(page) {
            assert.strictEqual(Array.isArray(page.zones.MainContentZone[2].item.fields.posts), true);
            done();
        })
        .catch(done);
    })

    
 })
 