var DataSourceChainer = require('./../../src/DataSourceChainer');
var sinon = require('sinon');
var toObservable = require('./../toObservable');
var noOp = function noOp() {};
var expect = require('chai').expect;
var AutoRespondDataSource = require('./../AutoRespondDataSource');

describe('Set', function() {
    it('should ensure that set only ever calls a dataSource once and the first.', function(done) {
        var onSet = sinon.spy();
        var innerSource = new AutoRespondDataSource({
            jsonGraph: {
                hello: {
                    world: 'foo bar'
                }
            }
        }, {
            onSet: onSet
        });
        var onSet2 = sinon.spy();
        var innerSource2 = new AutoRespondDataSource({
            jsonGraph: {
                hello: {
                    world: 'foo bar'
                }
            }
        }, {
            onSet2: onSet
        });
        var source = new DataSourceChainer([innerSource, innerSource2]);
        var onNext = sinon.spy();
        toObservable(source.
            set({
                jsonGraph: {
                    hello: {
                        world: 'foo bar'
                    }
                },
                paths: [['hello', 'world']]
            })).
            doAction(onNext, noOp, function() {
                expect(onNext.calledOnce).to.be.ok;
                expect(onSet.calledOnce).to.be.ok;
                expect(onSet2.callCount).to.equals(0);
                expect(onSet.getCall(0).args[0]).to.deep.equals({
                    jsonGraph: {
                        hello: {
                            world: 'foo bar'
                        }
                    },
                    paths: [['hello', 'world']]
                });
                expect(onNext.getCall(0).args[0]).to.deep.equals({
                    jsonGraph: {
                        hello: {
                            world: 'foo bar'
                        }
                    }
                });
            }).
            subscribe(noOp, done, done);
    });

    it('should work asynchronously.', function(done) {
        var onSet = sinon.spy();
        var innerSource = new AutoRespondDataSource({
            jsonGraph: {
                hello: {
                    world: 'foo bar'
                }
            }
        }, {
            onSet: onSet,
            wait: 100
        });
        var source = new DataSourceChainer([innerSource]);
        var onNext = sinon.spy();
        toObservable(source.
            set({
                jsonGraph: {
                    hello: {
                        world: 'foo bar'
                    }
                },
                paths: [['hello', 'world']]
            })).
            doAction(onNext, noOp, function() {
                expect(onNext.calledOnce).to.be.ok;
                expect(onSet.calledOnce).to.be.ok;
                expect(onSet.getCall(0).args[0]).to.deep.equals({
                    jsonGraph: {
                        hello: {
                            world: 'foo bar'
                        }
                    },
                    paths: [['hello', 'world']]
                });
                expect(onNext.getCall(0).args[0]).to.deep.equals({
                    jsonGraph: {
                        hello: {
                            world: 'foo bar'
                        }
                    }
                });
            }).
            subscribe(noOp, done, done);
    });
});
