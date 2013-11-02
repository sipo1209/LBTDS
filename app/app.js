/**
 * Module dependencies.
 */
var express = require('express');
var routes = require('./routes');
var path = require('path');
var MongoStore = require('connect-mongo')(express);
var settings = require('./settings');
var flash = require('connect-flash');

var app = module.exports = express();
// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());//默认图标
//app.use(express.favicon(__dirname + '/public/images/favicon.ico'));//自定义图标
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
//app.use(express.cookieParser('your secret here'));
//app.use(express.session());
app.use(express.cookieParser());
app.use(express.session({
    secret: settings.cookieSecret,
    key: settings.db,
    cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},//30 days
    store: new MongoStore({
        db: settings.db
    })
}));
app.use(flash());

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//dynamic helper
app.use(function(req, res, next){
    //res.locals.title = req.session.user;
    next();
});

//router
routes(app);

if (!module.parent){
    app.listen(app.get('port'), function(){
        console.log('Express server listening on port ' + app.get('port'));
    });
}



