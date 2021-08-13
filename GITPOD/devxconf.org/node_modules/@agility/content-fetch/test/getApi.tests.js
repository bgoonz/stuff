import chai from 'chai'
const assert = chai.assert;
const expect = chai.expect;

import agility from '../src/content-fetch'


//This is a synchronous test
describe('getApi:', function() {

    this.timeout('120s');
    
    it('should return an api client object with required params', function(done) {
        const api = agility.getApi({
            guid: 'some-guid',
            apiKey: 'some-access-token'
        });
        assert.strictEqual(typeof(api), "object");
        done();
    })

    it('should return an api client object in preview mode', function(done) {
        const api = agility.getApi({
            guid: 'some-guid',
            apiKey: 'some-access-token',
            isPreview: true
        });
        assert.strictEqual(api.config.isPreview, true);
        done();
    })

    it('should contain method for getContentItem', function(done) {
        const api = agility.getApi({
            guid: 'some-guid',
            apiKey: 'some-access-token'
        });
        assert.strictEqual(typeof(api.getContentItem), "function");
        done();
    })

    it('should contain method for getContentList', function(done) {
        const api = agility.getApi({
            guid: 'some-guid',
            apiKey: 'some-access-token'
        });
        assert.strictEqual(typeof(api.getContentList), "function");
        done();
    })

    it('should contain method for getPage', function(done) {
        const api = agility.getApi({
            guid: 'some-guid',
            apiKey: 'some-access-token'
        });
        assert.strictEqual(typeof(api.getPage), "function");
        done();
    })

    it('should contain method for getSitemapFlat', function(done) {
        const api = agility.getApi({
            guid: 'some-guid',
            apiKey: 'some-access-token'
        });
        assert.strictEqual(typeof(api.getSitemapFlat), "function");
        done();
    })

    it('should contain method for getSitemapNested', function(done) {
        const api = agility.getApi({
            guid: 'some-guid',
            apiKey: 'some-access-token'
        });
        assert.strictEqual(typeof(api.getSitemapNested), "function");
        done();
    })

    it('should return an api client with the baseUrl overidden if passed-in correctly as params', function(done) {
        const baseUrl = 'https://fake-url.agilitycms.com';
        const api = agility.getApi({
            guid: 'some-guid',
            apiKey: 'some-access-token',
            baseUrl: baseUrl
        });
        assert.strictEqual(api.config.baseUrl, baseUrl);
        done();
    });

    it('should return an api client with new stackpath baseUrl based on canada', function(done) {
        const baseUrl = 'https://api-ca.aglty.io/some-guid-c';
        const api = agility.getApi({
            guid: 'some-guid-c',
            apiKey: 'some-access-token',
            baseUrl: null
        });
        assert.strictEqual(api.config.baseUrl, baseUrl);
        done();
    });

    it('should return an api client with new stackpath baseUrl based on usa', function(done) {
        const baseUrl = 'https://api.aglty.io/some-guid-u';
        const api = agility.getApi({
            guid: 'some-guid-u',
            apiKey: 'some-access-token',
            baseUrl: null
        });
        assert.strictEqual(api.config.baseUrl, baseUrl);
        done();
    });

    it('should return an api client with new stackpath baseUrl based on dev', function(done) {
        const baseUrl = 'https://api-dev.aglty.io/some-guid-d';
        const api = agility.getApi({
            guid: 'some-guid-d',
            apiKey: 'some-access-token',
            baseUrl: null
        });
        assert.strictEqual(api.config.baseUrl, baseUrl);
        done();
    });

    it('should return an api client with legacy stackpath baseUrl', function(done) {
        const baseUrl = 'https://some-guid-api.agilitycms.cloud';
        const api = agility.getApi({
            guid: 'some-guid',
            apiKey: 'some-access-token',
            baseUrl: null
        });
        assert.strictEqual(api.config.baseUrl, baseUrl);
        done();
    });

    // TESTING EXCEPTIONS ----------------------------------------------------

    it('should throw an error if guid is not passed-in', function(done) {
        expect(function() {
            var api = agility.getApi({
                apiKey: 'some-access-token'
            });
            assert.strictEqual(typeof(api), "object");
            done();
        }).to.throw( TypeError );
        done();
    });

    it('should throw an error if apiKey is not passed-in', function(done) {
        expect(function() {
            var api = agility.getApi({
                guid: 'some-guid',
            });
            assert.strictEqual(typeof(api), "object");
            done();
        }).to.throw( TypeError );
        done();
    });

    it('should throw an error if caching maxAge is passed-in and is not a number', function(done) {
        expect(function() {
            var api = agility.getApi({
                guid: 'some-guid',
                apiKey: 'some-access-token',
                caching: {
                    maxAge: 'ten thousand miliseconds'
                }
            });
            assert.strictEqual(typeof(api), "object");
            done();
        }).to.throw( TypeError );
        done();
    });


    it('should throw an error if baseUrl is passed-in and is does not start with "https"', function(done) {
        expect(function() {
            var api = agility.getApi({
                guid: 'some-guid',
                apiKey: 'some-access-token',
                baseUrl: 'http://insecuresite.com'
            });
            assert.strictEqual(typeof(api), "object");
            done();
        }).to.throw( TypeError );
        done();
    });
 
});
