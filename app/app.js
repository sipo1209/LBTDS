/**
 * Module dependencies.
 */
var express = require('express');
var routes = require('./routes');
var path = require('path');
var MongoStore = require('connect-mongo')(express);
var settings = require('./settings');
var flash = require('connect-flash');

var app = module.exports = express();//module.exports是为了app能被cluster执行

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());//默认图标
//app.use(express.favicon(__dirname + '/public/images/favicon.ico'));//自定义图标
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({
    secret: settings.cookieSecret,
    key: settings.dbname,
    cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},//30 days
    store: new MongoStore({
        db: settings.dbName
    })
}));
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//dynamic helper
app.use(function(req, res, next){
    console.log('执行了');
    res.locals = {
        success: req.flash('success').toString(),
        error: req.flash('error').toString(),
        user: req.session.user,
        url: req.url
    };
    next();
});

//router
app.use(app.router);
routes(app);

if (!module.parent){
    app.listen(app.get('port'), function(){
        console.log('Express server listening on port ' + app.get('port'));
    });
}



