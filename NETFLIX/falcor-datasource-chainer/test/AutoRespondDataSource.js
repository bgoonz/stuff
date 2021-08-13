var Subscribable = require('./../src/Subscribable');
var AutoRespondDataSource = function AutoRespondDataSource(data, options) {
    this._options = options || {};
    this._data = data;
};

AutoRespondDataSource.prototype.get = function get(paths) {
    var options = this._options;
    var data = this._data;
    return new Subscribable(function getSubscribe(observer) {
        var disposed = false;
        if (options.onGet) {
            options.onGet(paths);
        }

        if (options.wait) {
            setTimeout(respond, options.wait);
        } else {
            respond();
        }

        function respond() {
            if (disposed) {
                return;
            }

            if (options.onError) {
                if (options.onNext) {
                    observer.onNext(data);
                }
                observer.onError(options.error);
            }

            else {
                onNext();
            }
        }

        function onNext() {
            observer.onNext(data);
            observer.onCompleted();
        }

        return function() {
            disposed = true;
        };
    });
};

AutoRespondDataSource.prototype.set = function set(jsonGraph) {
    var options = this._options;
    var data = this._data;
    return new Subscribable(function getSubscribe(observer) {
        var disposed = false;

        if (options.onSet) {
            options.onSet(jsonGraph);
        }

        if (options.wait) {
            setTimeout(respond, options.wait);
        } else {
            respond();
        }

        function respond() {
            if (disposed) {
                return;
            }

            if (options.onError) {
                observer.onError(options.error);
            }

            else {
                observer.onNext(data);
                observer.onCompleted();
            }
        }

        return function() {
            disposed = true;
        };
    });
};

module.exports = AutoRespondDataSource;
