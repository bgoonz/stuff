var noOp = function noOp() {};
var emptyDisposable = {dispose: noOp};

/**
 * A ModelResponse is a container for the results of a get, set, or call operation performed on a Model. The ModelResponse provides methods which can be used to specify the output format of the data retrieved from a Model, as well as how that data is delivered.
 * @constructor ModelResponse
 * @augments Observable
*/
function Subscribable(subscribe) {
    this._subscribe = subscribe;
}

Subscribable.prototype.subscribe = function subscribe(a, b, c) {
    var observer = a;
    if (!observer || typeof observer !== 'object') {
        observer = {
            onNext: a || noOp,
            onError: b || noOp,
            onCompleted: c || noOp
        };
    }
    var subscription = this._subscribe(observer);

    switch (typeof subscription) {
        case 'function':
            return { dispose: subscription };
        case 'object':
            return subscription || emptyDisposable;
        default:
            return emptyDisposable;
    }
};

module.exports = Subscribable;

