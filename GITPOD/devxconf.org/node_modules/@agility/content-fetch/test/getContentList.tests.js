import chai from 'chai'
const assert = chai.assert;
const expect = chai.expect;
import {
    createApiClient,
    createPreviewApiClient,
    createCachedApiClient,
    createApiClientWithNewCdn
} from './apiClients.config'

/*
    This file contains static references to content from the instance configured in the apiClient.config file.
*/


/* CONTENT LIST *****************************************************/
describe('getContentList:', function() {

    this.timeout('120s');

    it('should retrieve a content list in live mode', function(done) {
        var api = createApiClient();
        api.getContentList({
            referenceName: 'posts',
            languageCode: 'en-us'
        })
        .then(function(contentList) {
            assert.strictEqual(contentList.items[0].contentID, 15);
            assert.strictEqual(contentList.items[1].contentID, 16);
            done();
        })
        .catch(done);
    });

    it('should retrieve a content list in preview mode', function(done) {
        var api = createPreviewApiClient();
        api.getContentList({
            referenceName: 'posts',
            languageCode: 'en-us'
        })
        .then(function(contentList) {
            assert.strictEqual(contentList.items[0].contentID, 15);
            assert.strictEqual(contentList.items[1].contentID, 16);
            done();
        })
        .catch(done);
    });

    it('should throw error if referenceName not passed as argument for getContentList', function(done) {
        expect(function() {
            var api = createApiClient();
            api.getContentList({
                someOtherParam: 'posts',
                languageCode: 'en-us'
            })
            .then(function(contentList) {
                assert.strictEqual(contentList[0].contentID, 24);
                assert.strictEqual(contentList[1].contentID, 25);
                done();
            })
            .catch(done);
        }).to.throw( TypeError );
        done();
    });

    it('should throw error if languageCode param is missing in getContentList', function(done) {
        expect(function() {
            var api = createApiClient();
            api.getContentList({
                referenceName: 'posts'
            })
            .then(function(contentList) {
                assert.strictEqual(contentList[0].contentID, 24);
                assert.strictEqual(contentList[1].contentID, 25);
                done();
            })
            .catch(done);
        }).to.throw( TypeError );
        done();
    });

    it('should throw error if take parameter is NOT a number in getContentList', function(done) {
        expect(function() {
            var api = createApiClient();
            api.getContentList({
                referenceName: 'posts',
                languageCode: 'en-us',
                take: 'ten'
            })
            .then(function(contentList) {
                assert.strictEqual(contentList[0].contentID, 24);
                assert.strictEqual(contentList[1].contentID, 25);
                done();
            })
            .catch(done);
        }).to.throw( TypeError );
        done();
    });

    it('should throw error if take parameter is a number less than 1 in getContentList', function(done) {
        expect(function() {
            var api = createApiClient();
            api.getContentList({
                referenceName: 'posts',
                languageCode: 'en-us',
                take: 0
            })
            .then(function(contentList) {
                assert.strictEqual(contentList[0].contentID, 24);
                assert.strictEqual(contentList[1].contentID, 25);
                done();
            })
            .catch(done);
        }).to.throw( TypeError );
        done();
    });

    it('should throw error if take parameter is a number greater than 50 in getContentList', function(done) {
        expect(function() {
            var api = createApiClient();
            api.getContentList({
                referenceName: 'posts',
                languageCode: 'en-us',
                take: 51
            })
            .then(function(contentList) {
                assert.strictEqual(contentList[0].contentID, 24);
                assert.strictEqual(contentList[1].contentID, 25);
                done();
            })
            .catch(done);
        }).to.throw( TypeError );
        done();
    });

    it('should throw error if skip parameter is a number less than 0 in getContentList', function(done) {
        expect(function() {
            var api = createApiClient();
            api.getContentList({
                referenceName: 'posts',
                languageCode: 'en-us',
                skip: -1
            })
            .then(function(contentList) {
                assert.strictEqual(contentList[0].contentID, 24);
                assert.strictEqual(contentList[1].contentID, 25);
                done();
            })
            .catch(done);
        }).to.throw( TypeError );
        done();
    });

    it('should throw error if skip parameter is NOT a number in getContentList', function(done) {
        expect(function() {
            var api = createApiClient();
            api.getContentList({
                referenceName: 'posts',
                languageCode: 'en-us',
                skip: 'ten'
            })
            .then(function(contentList) {
                assert.strictEqual(contentList[0].contentID, 24);
                assert.strictEqual(contentList[1].contentID, 25);
                done();
            })
            .catch(done);
        }).to.throw( TypeError );
        done();
    });

    it('should throw error if direction parameter is NOT "asc" or "desc" in getContentList', function(done) {
        expect(function() {
            var api = createApiClient();
            api.getContentList({
                referenceName: 'posts',
                languageCode: 'en-us',
                sort: 'fields.title',
                direction: 'up'
            })
            .then(function(contentList) {
                assert.strictEqual(contentList[0].contentID, 24);
                assert.strictEqual(contentList[1].contentID, 25);
                done();
            })
            .catch(done);
        }).to.throw( TypeError );
        done();
    });

    it('should sort the content list in live mode', function(done) {
        var api = createApiClient();
        api.getContentList({
            referenceName: 'posts',
            languageCode: 'en-us',
            sort: 'properties.versionID',
            direction: api.types.SortDirections.DESC
        })
        .then(function(contentList) {
            assert.isTrue(contentList.items[0].contentID > contentList.items[1].contentID);
            done();
        })
        .catch(done);
    });

    it('should validate all filters contain property called \'property\'', function (done) {
        expect(function() {
            var api = createApiClient();
            api.getContentList({
                referenceName: 'posts',
                languageCode: 'en-us',
                filters: [{operator: api.types.FilterOperators.EQUAL_TO, value: '40'}]
            })
                .then(function(contentList) {
                    done();
                })
                .catch(done);
        }).to.throw( TypeError );
        done();
    });

    it('should validate all filters contain property called \'operator\'', function (done) {
        expect(function() {
            var api = createApiClient();
            api.getContentList({
                referenceName: 'posts',
                languageCode: 'en-us',
                filters: [{property: 'properties.versionID', value: '40'}]
            })
                .then(function(contentList) {
                    done();
                })
                .catch(done);
        }).to.throw( TypeError );
        done();
    });

    it('should validate all filters contain property called \'value\'', function (done) {
        expect(function() {
            var api = createApiClient();
            api.getContentList({
                referenceName: 'posts',
                languageCode: 'en-us',
                filters: [{property: 'properties.versionID', operator: api.types.FilterOperators.EQUAL_TO}]
            })
                .then(function(contentList) {
                    done();
                })
                .catch(done);
        }).to.throw( TypeError );
        done();
    });

    it('should validate operator property on all filters', function (done) {
        expect(function() {
            var api = createApiClient();
            api.getContentList({
                referenceName: 'posts',
                languageCode: 'en-us',
                filters: [{property: 'properties.versionID', operator: 'xx', value: '40'}]
            })
                .then(function(contentList) {
                    done();
                })
                .catch(done);
        }).to.throw( TypeError );
        done();
    });

    it('should validate the filtersLogicOperator to be AND or OR', function (done) {
        expect(function() {
            var api = createApiClient();
            api.getContentList({
                referenceName: 'posts',
                languageCode: 'en-us',
                filtersLogicOperator: 'SOME'
            })
                .then(function(contentList) {
                    done();
                })
                .catch(done);
        }).to.throw( TypeError );
        done();
    });

    it('should filter the content list in live mode with OR operator between filters', function(done) {
        var api = createApiClient();
        api.getContentList({
            referenceName: 'posts',
            languageCode: 'en-us',
            filters: [{property: 'contentID', operator: api.types.FilterOperators.EQUAL_TO, value: '15'}, {property: 'properties.referenceName', operator: api.types.FilterOperators.LIKE, value: 'posts'}],
            filtersLogicOperator: api.types.FilterLogicOperators.OR
        })
        .then(function(contentList) {
            assert.strictEqual(contentList.items[0].contentID, 15);
            assert.strictEqual(contentList.items[1].contentID, 16);
            done();
        })
        .catch(done);
    });

    it('should filter the content list in live mode with AND operator between filters', function(done) {
        var api = createApiClient();
        api.getContentList({
            referenceName: 'posts',
            languageCode: 'en-us',
            filters: [{property: 'contentID', operator: api.types.FilterOperators.EQUAL_TO, value: '16'}, {property: 'properties.referenceName', operator: api.types.FilterOperators.LIKE, value: 'posts'}],
            filtersLogicOperator: api.types.FilterLogicOperators.AND
        })
        .then(function(contentList) {
            assert.strictEqual(contentList.items[0].contentID, 16);
            assert.strictEqual(contentList.items.length, 1);
            done();
        })
        .catch(done);
    });

    it('should expand all content links when expandContentLinks are set to true', function(done) {
        var api = createApiClient();
        api.getContentList({
            referenceName: 'listwithnestedcontentlink',
            languageCode: 'en-us',
            expandAllContentLinks: true
        })
        .then(function(contentList) {
            assert.strictEqual(Array.isArray(contentList.items[0].fields.posts), true);
            done();
        })
        .catch(done);
    })

    it('should NOT expand all content links when expandContentLinks are set to false', function(done) {
        var api = createApiClient();
        api.getContentList({
            referenceName: 'listwithnestedcontentlink',
            languageCode: 'en-us',
            expandAllContentLinks: false
        })
        .then(function(contentList) {
            assert.strictEqual(Array.isArray(contentList.items[0].fields.posts), false);
            done();
        })
        .catch(done);
    })

    it('should NOT expand all content links when expandContentLinks is not set at all', function(done) {
        var api = createApiClient();
        api.getContentList({
            referenceName: 'listwithnestedcontentlink',
            languageCode: 'en-us'
        })
        .then(function(contentList) {
            assert.strictEqual(Array.isArray(contentList.items[0].fields.posts), false);
            done();
        })
        .catch(done);
    })

    it('should be able to fetch a list using global cdn site', function(done) {
        var api = createApiClientWithNewCdn();
        let referenceName = 'jssdklist';
        api.getContentList({
            referenceName: referenceName,
            languageCode: 'en-us'
        })
            .then(function(contentList) {
                assert.strictEqual(contentList.items[0].properties.referenceName, referenceName);
                done();
            })
            .catch(done);
    })
});