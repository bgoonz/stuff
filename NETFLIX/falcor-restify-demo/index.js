'use strict';

// external requires
var bunyan = require('bunyan');
var restify = require('restify');
var restifyCookies = require('restify-cookies');

// falcor requires
var falcorPlugin = require('falcor-restify');
var falcorRouter = require('falcor-router-demo');

// local globals
var log = bunyan.createLogger({
    name: 'falcor-restify-demo',
    level: bunyan.DEBUG,
    src: true
});
var server = restify.createServer({
    log: log.child({
        component: 'server',
        level: bunyan.INFO,
        streams: [{
            level: bunyan.DEBUG,
            type: 'raw',
            stream: new restify.bunyan.RequestCaptureStream({
                level: bunyan.WARN,
                maxRecords: 100,
                maxRequestIds: 1000,
                stream: process.stderr
            })
        }],
        serializers: bunyan.stdSerializers
    })
});


// set up universal handlers
server.use(restify.requestLogger());
server.use(restifyCookies.parse);
server.use(restify.queryParser());
server.use(restify.bodyParser({ mapParams: true }));

// handle uncaught exceptions
server.on('uncaughtException', function(req, res, route, err) {
    req.log.error(err, 'got uncaught exception');
});

// set up audit logger
server.on('after', restify.auditLogger({
    log: log.child({
        component: 'audit'
    })
}));


// set up handlers for get/post/static content
server.post('/model.json', falcorPlugin(function(req, res, next) {
    var userId = req.cookies && req.cookies.userId;
    return falcorRouter(userId);
}));

server.get('/model.json', falcorPlugin(function(req, res, next) {
    var userId = req.cookies && req.cookies.userId;
    return falcorRouter(userId);
}));

server.get(/\/.*/, restify.serveStatic({
    directory: __dirname,
    default: 'index.html'
}));


// start the server!
server.listen(9090, function(err) {
    if (err) {
        log.error({err: err});
        process.exit(1);
    }
    log.info('navigate to http://localhost:9090');
});

