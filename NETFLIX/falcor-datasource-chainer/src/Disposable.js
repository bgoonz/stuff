var Disposable = function Disposable() {
    this.disposed = false;
};

module.exports = Disposable;

Disposable.prototype.dispose = function dispose() {
    this.disposed = true;
};

