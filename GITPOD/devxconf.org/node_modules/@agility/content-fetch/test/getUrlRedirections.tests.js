import chai from 'chai'
const assert = chai.assert;
const expect = chai.expect;

import { createApiClient } from './apiClients.config'

/*
    This file contains static references to content from the instance configured in the apiClient.config file.
*/

/* GET URL REDIRECTIONS *********************************************************/


describe('getUrlRedirections:', function() {

	this.timeout('120s');

	let persistedLastAccessDate = null;

    it('should retrieve the list of URL redirections', function(done) {
        var api = createApiClient();
        api.getUrlRedirections({
            lastAccessDate: null
        })
            .then(function({ lastAccessDate, isUpToDate, items }) {

				assert.isArray(items, "the items should be an array.");

				assert.isFalse(isUpToDate, "the results should NOT be up to date" )
				assert.isDefined(lastAccessDate, "the lastAccessDate should be a returned.");

				let dt = new Date(lastAccessDate);

				assert.isTrue(dt.getUTCFullYear() > 2000, "the lastAccessDate should be a recent date.")

				persistedLastAccessDate = lastAccessDate;

                done();
            })
            .catch(done);
	});

	it('should retrieve an empty list of URL redirections with saved last access date', function(done) {
        var api = createApiClient();
        api.getUrlRedirections({
            lastAccessDate: persistedLastAccessDate
        })
            .then(function({lastAccessDate, items, isUpToDate}) {

				assert.isArray(items, "the items should be an array.");
				assert.isTrue(isUpToDate, "the results should be up to date" )
				assert.equal(items.length, 0, "the list of items should be empty.")

                done();
            })
            .catch(done);
    });


});
