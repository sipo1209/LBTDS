var crypto = require('crypto'),
    User = require('../models/user.js'),
    Post = require('../models/post.js');
/*
 * GET home page.
 */
module.exports = function(app){

    app.get('/', function(req, res){
        if (req.session.user) {
            res.redirect('/livemap');
        }
        else {
            res.redirect('/login');
        }
    });

    app.get('/livemap', checkLogin);
    app.get('/livemap', function(req, res){
        res.render('livemap', {
            title: '实况地图',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString(),
            currenturl: req.url
        })
    });

    app.get('/reg', checkNotLogin);
    app.get('/reg', function(req, res){
        res.render('reg', {
            title: '注册',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString(),
            currenturl: req.url
        })
    });
    app.post('/reg', checkNotLogin);
    app.post('/reg', function(req, res){
        var username = req.body.username,
            password = req.body.password,
            password_re = req.body['password-repeat'];
        //检验用户两次输入的密码是否一致
        if (password_re != password) {
            req.flash('error', '两次输入的密码不一致!');
            return res.redirect('/reg');
        }
        //生成密码的 md5 值
        var md5 = crypto.createHash('md5'),
            password = md5.update(req.body.password).digest('hex');
        var newUser = new User({
            username: req.body.username,
            password: password
        });
        //检查用户名是否已经存在
        User.get(newUser.username, function (err, user) {
            if (user) {
                req.flash('error', '用户已存在!');
                return res.redirect('/reg');//用户名存在则返回注册页
            }
            //如果不存在则新增用户
            newUser.save(function (err, user) {
                console.log('尝试写入数据库');
                if (err) {
                    req.flash('error', err);
                    return res.redirect('/reg');
                }
                req.session.user = newUser;//用户信息存入 session
                req.flash('success', '注册成功!');
                return res.redirect('/');//注册成功后返回主页
            });
        });
    });

    app.get('/login', checkNotLogin);
    app.get('/login', function(req, res){
        res.render('login', {
            title: '登陆',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString(),
            currenturl: req.url
        })
    });
    app.post('/login', checkNotLogin);
    app.post('/login', function(req, res){
        //生成密码的 md5 值
        var md5 = crypto.createHash('md5'),
            password = md5.update(req.body.password).digest('hex');
        //检查用户是否存在
        User.get(req.body.username, function (err, user) {
            if (!user) {
                req.flash('error', '用户不存在!');
                return res.redirect('/login');//用户不存在则跳转到登录页
            }
            //检查密码是否一致
            if (user.password != password) {
                req.flash('error', '密码错误!');
                return res.redirect('/login');//密码错误则跳转到登录页
            }
            //用户名密码都匹配后，将用户信息存入 session
            req.session.user = user;
            req.flash('success', '登陆成功!');
            return res.redirect('/');
        });
    });

    app.get('/logout', checkLogin);
    app.get('/logout', function(req, res){
        req.session.user = null;
        req.flash('success', '登出成功!');
        return res.redirect('/');
    });

    app.get('/account', checkLogin);
    app.get('/account', function(req, res){
        res.render('account', {
            title: '账号管理',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString(),
            currenturl: req.url
        })
    });

    app.use(function (req, res) {
        res.render("404", {
            title: '没有找到该页面',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString(),
            currenturl: req.url
        });
    });

    //两个辅助函数
    function checkLogin(req, res, next) {
        if (!req.session.user) {
            req.flash('error', '未登录!');
            res.redirect('/login');
        }
        next();
    }

    function checkNotLogin(req, res, next) {
        if (req.session.user) {
            req.flash('error', '已登录!');
            res.redirect('back');
        }
        next();
    }
}





