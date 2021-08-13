/**
* Module dependencies.
*/
var passport = require('passport')
, util = require('util');


/**
* `Strategy` constructor.
*
* The dummy authentication strategy automatically authenticates requests.
*
* Applications must supply a `verify` callback which calls the `done` callback 
* supplying a `user`, which should be set to `false` if the credentials are
* not valid.
* If an exception occured, `err` should be set.
*
* Optionally, `options` can be used to change the fields in which the
* credentials are found.
*
* Options:
*   - `allow`  Successfully authenticate, defaults to _true_
*
* Examples:
*
*     passport.use(new DummyStrategy(
*       function(done) {
*       var user = { username: 'dummy' }
*           done(null, user);
*       }
*     ));
*
* @param {Object} options
* @param {Function} verify
* @api public
*/
function Strategy(options, verify) {
    if (typeof options == 'function') {
        verify = options;
        options = {};
    }
    if (!verify) throw new Error('dummy authentication strategy requires a verify function');

    this._allow = options.allow || true;

    passport.Strategy.call(this);
    this.name = 'dummy';
    this.verify = verify;
}

/**
* Inherit from `passport.Strategy`.
*/
util.inherits(Strategy, passport.Strategy);

/**
* Authenticate request.
*
* @param {Object} req
* @api protected
*/
Strategy.prototype.authenticate = function(req) {
    if (!this._allow) {
        return this.fail();
    }

    var self = this;
    this.verify(function(err, user) {
        if (err) { return self.error(err); }
        if (!user) { return self.fail(); }
        self.success(user, {});
    });
}


/**
* Expose `Strategy`.
*/ 
module.exports = Strategy;
