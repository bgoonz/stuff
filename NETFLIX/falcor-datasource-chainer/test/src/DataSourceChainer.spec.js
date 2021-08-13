var DataSourceChainer = require('./../../src/DataSourceChainer');
var AtLeastOneDataSourceError = require('./../../src/errors/AtLeastOneDataSourceError');
var expect = require('chai').expect;

describe('DataSourceChainer', function() {
    require('./get.spec');
    require('./set.spec');
    require('./errors.spec');
    require('./disposing.spec');
    it('should construct a dataSource without any inner datasources and throw an error.', function() {
        var thrown = false;
        try {
            new DataSourceChainer();
        } catch (e) {
            expect(e instanceof AtLeastOneDataSourceError).to.be.ok;
            thrown = true;
        }
        expect(thrown).to.be.ok;
    });
});
