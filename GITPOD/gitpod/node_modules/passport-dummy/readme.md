# Passport-Dummy

[Passport](https://github.com/jaredhanson/passport) strategy for dummy authentication.

## Installation

    $ npm install passport-dummy

## Usage

#### Configure Strategy

The dummy authentication strategy authenticates or denies all requests based on the
'allow' option passed to it.

    passport.use(new DummyStrategy(
      function(done) {
        return done(null, {username: 'dummy'});
      }
    ));

#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'dummy'` strategy, to
authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

    app.post('/login', 
      passport.authenticate('dummy', { failureRedirect: '/login' }),
      function(req, res) {
        res.redirect('/');
      });


## Credits

  - [Adrian Rossouw](http://github.com/Vertice)
  - [Jared Hanson](http://github.com/jaredhanson)

## License

(The MIT License)
