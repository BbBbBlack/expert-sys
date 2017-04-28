var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require('cors');
var config = require('./config');
var history = require('connect-history-api-fallback');

var app = express();

// Use native promises
mongoose.Promise = global.Promise;
mongoose.connect(config.mongo.uri);

app.use(history());
app.use(cors({
	origin: true,
	credentials: true
}));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(cookieParser());
app.use(session({
	secret: config.session.secret,
	resave: false,
	saveUninitialized: false, // 惰性session
	store: new MongoStore({
		url: config.mongo.uri,
		autoReconnect: true,
		collection: 'sessions'
	})
}));

app.set('views', './view')
app.set('view engine', 'html')

var static_addr = path.join(__dirname, '/public')

app.use(express.static(static_addr))

app.get("/mob", function(req, res) {
	return res.render('mob', {})
})

app.get("/admin", function(req, res) {
  return res.render('admin', {})
})

require('./route')(app)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'dev' ? err : {};

	// render the error page
	res.status(err.status || 500);
});

app.listen(config.port, function() {
	console.log('server listening on %d', config.port)
})

module.exports = app;
