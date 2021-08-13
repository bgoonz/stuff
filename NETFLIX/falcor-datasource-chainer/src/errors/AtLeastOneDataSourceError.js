var MESSAGE = 'The DataSourceChainer requires at least one dataSource ' +
              'in its constructor.';
/**
 * A data source chainer was initialized without any sources.
 *
 * @private
 */
function AtLeastOneDataSourceError() {
    this.message = MESSAGE;
    this.stack = (new Error()).stack;
}

AtLeastOneDataSourceError.prototype = new Error();
AtLeastOneDataSourceError.message = MESSAGE;

module.exports = AtLeastOneDataSourceError;

