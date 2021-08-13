var DataSourceChainer = require('./../../src/DataSourceChainer');
var sinon = require('sinon');
var toObservable = require('./../toObservable');
var noOp = function noOp() {};
var expect = require('chai').expect;
var AutoRespondDataSource = require('./../AutoRespondDataSource');
var falcorJGraph = require('falcor-json-graph');
var atom = falcorJGraph.atom;
var ref = falcorJGraph.ref;

describe('Get', function() {

    it('should be ok with happy case DataSource where the first DataSource fills all data (sync).', function(done) {
        var innerSource = new AutoRespondDataSource({
            jsonGraph: {
                hello: {
                    world: 'foo bar'
                }
            }
        });
        var source = new DataSourceChainer([innerSource]);
        var onNext = sinon.spy();
        toObservable(source.
            get([['hello', 'world']])).
            doAction(onNext, noOp, function() {
                expect(onNext.calledOnce).to.be.ok;
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

    it('should be ok with happy case DataSource where the first DataSource fills all data (async).', function(done) {
        var innerSource = new AutoRespondDataSource({
            jsonGraph: {
                hello: {
                    world: 'foo bar'
                }
            }
        }, {wait: 100});
        var source = new DataSourceChainer([innerSource]);
        var onNext = sinon.spy();
        toObservable(source.
            get([['hello', 'world']])).
            doAction(onNext, noOp, function() {
                expect(onNext.calledOnce).to.be.ok;
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

    it('should merge in two requests into a single jsonGraphResponse.', function(done) {
        var onGet1 = sinon.spy();
        var onGet2 = sinon.spy();
        var partial1 = new AutoRespondDataSource({
            jsonGraph: {
                hello: {
                    world: 'foo'
                }
            },
            unhandledPaths: [['hello', 'foo']]
        }, {
            wait: 100,
            onGet: onGet1
        });
        var partial2 = new AutoRespondDataSource({
            jsonGraph: {
                hello: {
                    foo: 'bar'
                }
            }
        }, {
            wait: 100,
            onGet: onGet2
        });

        var source = new DataSourceChainer([partial1, partial2]);
        var onNext = sinon.spy();
        toObservable(source.
            get([['hello', ['world', 'foo']]])).
            doAction(onNext, noOp, function() {
                expect(onNext.calledOnce).to.be.ok;
                expect(onGet1.calledOnce).to.be.ok;
                expect(onGet2.calledOnce).to.be.ok;
                expect(onGet1.getCall(0).args[0]).to.deep.equals([['hello', ['world', 'foo']]]);
                expect(onGet2.getCall(0).args[0]).to.deep.equals([['hello', 'foo']]);
                expect(onNext.getCall(0).args[0]).to.deep.equals({
                    jsonGraph: {
                        hello: {
                            world: 'foo',
                            foo: 'bar'
                        }
                    }
                });
            }).
            subscribe(noOp, done, done);
    });

    it('should merge in messages from 3 jsonGraphEnvelops but no pathOptimizations should occur.  Should verify that paths are the unhandledPaths.', function(done) {
        var onGet1 = sinon.spy();
        var onGet2 = sinon.spy();
        var onGet3 = sinon.spy();
        var partial1 = new AutoRespondDataSource({
            jsonGraph: {
                hello: {
                    world: 'foo'
                }
            },
            unhandledPaths: [['hello', ['foo', 'baz']]]
        }, {
            wait: 100,
            onGet: onGet1
        });
        var partial2 = new AutoRespondDataSource({
            jsonGraph: {
                hello: {
                    foo: 'bar'
                }
            },
            unhandledPaths: [['hello', 'baz']]
        }, {
            wait: 100,
            onGet: onGet2
        });
        var partial3 = new AutoRespondDataSource({
            jsonGraph: {
                hello: {
                    baz: 'phazz'
                }
            }
        }, {
            wait: 100,
            onGet: onGet3
        });

        var source = new DataSourceChainer([partial1, partial2, partial3]);
        var onNext = sinon.spy();
        toObservable(source.
            get([['hello', ['world', 'foo', 'baz']]])).
            doAction(onNext, noOp, function() {
                expect(onNext.calledOnce).to.be.ok;
                expect(onGet1.calledOnce).to.be.ok;
                expect(onGet2.calledOnce).to.be.ok;
                expect(onGet3.calledOnce).to.be.ok;
                expect(onGet1.getCall(0).args[0]).to.deep.equals([['hello', ['world', 'foo', 'baz']]]);
                expect(onGet2.getCall(0).args[0]).to.deep.equals([['hello', ['foo', 'baz']]]);
                expect(onGet3.getCall(0).args[0]).to.deep.equals([['hello', 'baz']]);
                expect(onNext.getCall(0).args[0]).to.deep.equals({
                    jsonGraph: {
                        hello: {
                            world: 'foo',
                            foo: 'bar',
                            baz: 'phazz'
                        }
                    }
                });
            }).
            subscribe(noOp, done, done);
    });

    it('should get 2 messages and the third one should alter remaining missing paths based on cache and not fire.', function(done) {
        var onGet1 = sinon.spy();
        var onGet2 = sinon.spy();
        var onGet3 = sinon.spy();
        var partial1 = new AutoRespondDataSource({
            jsonGraph: {
                hello: {
                    world: ref(['foo'])
                },
                foo: {
                    bar: atom('hello bar')
                }
            },
            unhandledPaths: [
                ['foo', 'baz'],
                ['hello', 'universe', ['bar', 'baz']]
            ]
        }, {
            wait: 100,
            onGet: onGet1
        });
        var partial2 = new AutoRespondDataSource({
            jsonGraph: {
                foo: {
                    baz: atom('hello baz')
                }
            },
            unhandledPaths: [
                ['foo', 'bar']
            ]
        }, {
            wait: 100,
            onGet: onGet2
        });
        var partial3 = new AutoRespondDataSource({}, {
            wait: 100,
            onGet: onGet3
        });

        var source = new DataSourceChainer([partial1, partial2, partial3]);
        var onNext = sinon.spy();
        toObservable(source.
            get([['hello', ['world', 'universe'], ['bar', 'baz']]])).
            doAction(onNext, noOp, function() {
                expect(onNext.calledOnce).to.be.ok;
                expect(onGet1.calledOnce).to.be.ok;
                expect(onGet2.calledOnce).to.be.ok;
                expect(onGet3.callCount).to.equal(0);
                expect(onGet1.getCall(0).args[0]).to.deep.equals([
                    ['hello', ['world', 'universe'], ['bar', 'baz']]
                ]);
                expect(onGet2.getCall(0).args[0]).to.deep.equals([
                    ['foo', 'baz'],
                    ['hello', 'universe', ['bar', 'baz']]
                ]);
                expect(onNext.getCall(0).args[0]).to.deep.equals({
                    jsonGraph: {
                        hello: {
                            world: ref(['foo'])
                        },
                        foo: {
                            bar: atom('hello bar'),
                            baz: atom('hello baz')
                        }
                    },
                    unhandledPaths: []
                });
            }).
            subscribe(noOp, done, done);
    });

    it('should get 3 messages, the second messages unhandledPaths can be optimized by the firsts.', function(done) {
        var onGet1 = sinon.spy();
        var onGet2 = sinon.spy();
        var onGet3 = sinon.spy();
        var partial1 = new AutoRespondDataSource({
            jsonGraph: {
                hello: {
                    world: ref(['foo'])
                }
            },
            unhandledPaths: [
                ['foo', 'baz'],
                ['hello', 'universe', ['bar', 'baz']]
            ]
        }, {
            wait: 100,
            onGet: onGet1
        });
        var partial2 = new AutoRespondDataSource({
            jsonGraph: {
                hello: {
                    universe: ref(['hello', 'world'])
                }
            },
            unhandledPaths: [
                ['foo', 'baz'],
                ['hello', 'world', ['bar', 'baz']]
            ]
        }, {
            wait: 100,
            onGet: onGet2
        });
        var partial3 = new AutoRespondDataSource({
            jsonGraph: {
                foo: {
                    bar: atom('hello bar'),
                    baz: atom('hello baz')
                }
            }
        }, {
            wait: 100,
            onGet: onGet3
        });

        var source = new DataSourceChainer([partial1, partial2, partial3]);
        var onNext = sinon.spy();
        toObservable(source.
            get([['hello', ['world', 'universe'], ['bar', 'baz']]])).
            doAction(onNext, noOp, function() {
                expect(onNext.calledOnce).to.be.ok;
                expect(onGet1.calledOnce).to.be.ok;
                expect(onGet2.calledOnce).to.be.ok;
                expect(onGet3.calledOnce).to.be.ok;
                expect(onGet1.getCall(0).args[0]).to.deep.equals([
                    ['hello', ['world', 'universe'], ['bar', 'baz']]
                ]);
                expect(onGet2.getCall(0).args[0]).to.deep.equals([
                    ['foo', 'baz'],
                    ['hello', 'universe', ['bar', 'baz']]
                ]);
                expect(onGet3.getCall(0).args[0]).to.deep.equals([
                    ['foo', ['bar', 'baz']]
                ]);

                // unhandledPaths key does not show up since during onCompleted
                // the jsonGraphFromSource did not have unhandledPaths we can
                // just onNext the seed.
                expect(onNext.getCall(0).args[0]).to.deep.equals({
                    jsonGraph: {
                        hello: {
                            world: ref(['foo']),
                            universe: ref(['hello', 'world'])
                        },
                        foo: {
                            bar: atom('hello bar'),
                            baz: atom('hello baz')
                        }
                    }
                });
            }).
            subscribe(noOp, done, done);
    });
});
