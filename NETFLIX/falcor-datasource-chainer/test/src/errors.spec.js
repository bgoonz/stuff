var DataSourceChainer = require('./../../src/DataSourceChainer');
var sinon = require('sinon');
var toObservable = require('./../toObservable');
var noOp = function noOp() {};
var expect = require('chai').expect;
var AutoRespondDataSource = require('./../AutoRespondDataSource');
var falcorJGraph = require('falcor-json-graph');
var error = falcorJGraph.error;
var doneOrErrorOnAssertion = require('./../doneOrErrorOnAssertion');

describe('Error', function() {
    it('should have on the first dataSource, no further datatSource should be called.', function(done) {
        var onGet1 = sinon.spy();
        var onGet2 = sinon.spy();
        var partial1 = new AutoRespondDataSource({ }, {
            wait: 100,
            onGet: onGet1,
            onError: true,
            error: error('ohh no!')
        });
        var partial2 = new AutoRespondDataSource({ }, {
            wait: 100,
            onGet: onGet2
        });

        var source = new DataSourceChainer([partial1, partial2]);
        var onNext = sinon.spy();

        toObservable(source.
            get([['hello', 'world']])).
            doAction(onNext, function(err) {
                expect(onNext.callCount).to.equal(0);
                expect(onGet1.calledOnce).to.be.ok;
                expect(onGet2.callCount).to.equal(0);
                expect(onGet1.getCall(0).args[0]).to.deep.equals([
                    ['hello', 'world']
                ]);

                // unhandledPaths key does not show up since during onCompleted
                // the jsonGraphFromSource did not have unhandledPaths we can
                // just onNext the seed.
                expect(err).to.deep.equals([{
                    path: ['hello', 'world'],
                    value: error('ohh no!')
                }]);
            }).
            subscribe(noOp, doneOrErrorOnAssertion(done), done);
    });

    it('should get the incomplete message from the first dataSource even when the second fails.', function(done) {
        var onGet1 = sinon.spy();
        var onGet2 = sinon.spy();
        var partial1 = new AutoRespondDataSource({
            jsonGraph: {
                hello: {
                    foo: 'bazz'
                }
            },
            unhandledPaths: [
                ['hello', 'bar']
            ]
        }, {
            wait: 100,
            onGet: onGet1
        });
        var partial2 = new AutoRespondDataSource({ }, {
            wait: 100,
            onGet: onGet2,
            onError: true,
            error: error('ohh no!')
        });

        var source = new DataSourceChainer([partial1, partial2]);
        var onNext = sinon.spy();

        toObservable(source.
            get([['hello', ['foo', 'bar']]])).
            doAction(onNext, function(err) {
                expect(onNext.calledOnce).to.be.ok;
                expect(onGet1.calledOnce).to.be.ok;
                expect(onGet2.calledOnce).to.be.ok;
                expect(onNext.getCall(0).args[0]).to.deep.equals({
                    jsonGraph: {
                        hello: {
                            foo: 'bazz'
                        }
                    }
                });
                expect(err).to.deep.equals([{
                    path: ['hello', 'bar'],
                    value: error('ohh no!')
                }]);
            }).
            subscribe(noOp, doneOrErrorOnAssertion(done), done);
    });

    it('should be able to adhere to a dataSource that onNexts and onErrors (a chained data source is a dataSource within the chain.)', function(done) {
        var onGet1 = sinon.spy();
        var onGet2 = sinon.spy();
        var partial1 = new AutoRespondDataSource({
            jsonGraph: {
                hello: {
                    foo: 'hello foo'
                }
            },
            unhandledPaths: [
                ['hello', ['bar', 'baz']]
            ]
        }, {
            wait: 100,
            onGet: onGet1
        });
        var partial2 = new AutoRespondDataSource({
            jsonGraph: {
                hello: {
                    bar: 'hello bar'
                }
            }
        }, {
            wait: 100,
            onGet: onGet2,
            onError: true,
            onNext: true,
            error: [{
                path: ['hello', 'baz'],
                value: error('ohh no!')
            }]
        });

        var source = new DataSourceChainer([partial1, partial2]);
        var onNext = sinon.spy();

        toObservable(source.
            get([['hello', ['foo', 'bar', 'baz']]])).
            doAction(onNext, function(err) {
                expect(onNext.calledOnce).to.be.ok;
                expect(onNext.getCall(0).args[0]).to.deep.equals({
                    jsonGraph: {
                        hello: {
                            foo: 'hello foo',
                            bar: 'hello bar'
                        }
                    }
                });
                expect(err).to.deep.equals([{
                    path: ['hello', 'baz'],
                    value: error('ohh no!')
                }]);
            }).
            subscribe(noOp, doneOrErrorOnAssertion(done), done);
    });
});
