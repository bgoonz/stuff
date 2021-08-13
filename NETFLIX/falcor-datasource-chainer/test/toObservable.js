var Rx = require('rx');
module.exports = function toObservable(subscribable) {
    return Rx.Observable.create(function create(observer) {
        return subscribable.subscribe(observer);
    });
};
