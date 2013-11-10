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


app.get('/',routes.index);
app.get('/login',routes.verifyNotLogin,routes.login);
app.post('/login',routes.verifyNotLogin,routes.loginPost);
app.get('/register',routes.verifyNotLogin,routes.register);
app.post('/register',routes.verifyNotLogin,routes.registerPost);

app.get('/logout',routes.verifyLogin,routes.logout);
app.get('/monitor',routes.verifyLogin,routes.monitor);
app.get('/users',routes.verifyLogin,routes.users);
app.get('/users/:username',routes.verifyLogin,routes.user);

app.post('/json',routes.verifyLogin,routes.json);



app.use(function (req, res) {
    res.render("404", {
        title: '没有找到该页面'
    });
});

if (!module.parent){
    app.listen(app.get('port'), function(){
        console.log('Express server listening on port ' + app.get('port'));
    });
}



