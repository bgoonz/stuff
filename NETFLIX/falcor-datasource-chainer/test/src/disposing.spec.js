var DataSourceChainer = require('./../../src/DataSourceChainer');
var sinon = require('sinon');
var toObservable = require('./../toObservable');
var noOp = function noOp() {};
var expect = require('chai').expect;
var AutoRespondDataSource = require('./../AutoRespondDataSource');
var doneOrErrorOnThrow = require('./../doneOrErrorOnThrow');

describe('Disposing', function() {
    it('should have on the first dataSource, no further datatSource should be called.', function(done) {
        var onGet = sinon.spy();
        var ds = new AutoRespondDataSource({ }, {
            wait: 100,
            onGet: onGet
        });

        var source = new DataSourceChainer([ds]);
        var onNext = sinon.spy();
        var onCompleted = sinon.spy();

        var disposable =
            toObservable(source.
                get([['hello', 'world']])).
                doAction(onNext, noOp, onCompleted).
                subscribe(noOp, done, done);

        disposable.dispose();
        setTimeout(doneOrErrorOnThrow(function() {
            expect(onNext.callCount).to.equals(0);
            expect(onCompleted.callCount).to.equals(0);
        }, done), 200);
    });
});
