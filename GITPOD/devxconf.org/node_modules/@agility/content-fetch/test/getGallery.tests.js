import chai from 'chai'
const assert = chai.assert;
const expect = chai.expect;

import { createApiClient } from './apiClients.config'

/*
    This file contains static references to content from the instance configured in the apiClient.config file.
*/



/* GET GALLERY *********************************************************/


describe('getGallery:', function() {

    this.timeout('120s');

    it('should retrieve a Gallery in live mode', function(done) {
        var api = createApiClient();
        api.getGallery({
            galleryID: 1
        })
            .then(function(gallery) {
                assert.strictEqual(gallery.galleryID, 1);
                done();
            })
            .catch(done);
    });


});
