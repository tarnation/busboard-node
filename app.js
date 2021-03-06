
/**
 * Module dependencies
 */

var express   =  require('express'),
  routes      =  require('./routes'),
  api         =  require('./routes/api'),
  http        =  require('http'),
  path        =  require('path'),
  config      =  require( './settings' ),
  mongoStore  =  require('connect-mongo')(express);


var app = module.exports = express();
// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.cookieParser());
app.use(express.session({
    secret: config.session.secret,
    store: new mongoStore({
        db: config.db_config.name,
        host: config.db_config.host
    }),
}));
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

// Custom CSRF location from Angular
var csrfValue = function(req) {
  var token = (req.body && req.body._csrf)
    || (req.query && req.query._csrf)
    || (req.headers['x-csrf-token'])
    || (req.headers['x-xsrf-token']);
  return token;
};
app.use(express.csrf({value: csrfValue}));
app.use(function(req, res, next) {
  res.cookie('XSRF-TOKEN', req.session._csrf);
  next();
});

// development only
if (app.get('env') === 'development') {
  app.use(express.errorHandler());
}

// production only
if (app.get('env') === 'production') {
  // TODO
}


/**
 * Routes
 */

// serve index and view partials
app.get('/', routes.index);
app.get('/partials/:name', routes.partials);

// JSON API
app.post('/api/user', api.users.addUser.bind(api.users));
app.get( '/api/user', api.users.getSessionUser.bind( api.users ) );
app.post('/api/login', api.users.login.bind(api.users));
app.delete('/api/logout', api.users.logout.bind(api.users));
app.post('/api/stops', api.users.addStop.bind(api.users));
app.get('/api/stops', api.users.getHotStops.bind(api.users));
app.post('/api/stops/delete', api.users.removeHotStop.bind(api.users));

// redirect all others to the index (HTML5 history)
app.get('*', routes.index);


/**
 * Start Server
 */

http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
