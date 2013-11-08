var crypto = require('crypto');
var User = require('../models/user.js');
/*
 * GET home page.
 */
module.exports = function(app){

    app.get('/', function(req, res){
        if (req.session.user) {
            res.redirect('/monitor');
        }
        else {
            res.redirect('/login');
        }
    });

    app.get('/monitor', checkLogin);
    app.get('/monitor', function(req, res){
        User.getList('staff', function (err, staffs) {
            if (!staffs) {
                req.flash('error', '查询不到!');
                return res.redirect('/');//用户不存在则跳转到账号管理页
            }
            res.render('monitor', {
                title: '车辆监控',
                user: req.session.user,
                staffs: staffs
            })
        });
    });

    app.get('/register', function(req, res){
        if(!req.session.user || (req.session.user && req.session.user.userType == 'admin')) {//未登录者or管理员
            //决定registerType的值（registerType的值用来决定ejs显示哪些控件）
            if(!req.session.user || (req.session.user && req.query.registerType != 'admin')) {//未登录者只能注册staff，管理员若没有请求注册admin类型则也为staff
                req.query.registerType = 'staff';
            }
            res.render('register', {
                title: '注册',
                registerType: req.query.registerType
            });
        }
        else {//员工
            req.flash('error', '已登录!');
            return res.redirect('back');
        }
    });

    app.post('/register', function(req, res){
        if(!req.session.user || (req.session.user && req.session.user.userType == 'admin')) {//未登录者or管理员
            //检查用户有权限把userType给admin，否则就给staff
            console.log(req.session.user.userType);
            console.log(req.body.userType);
            if(!req.session.user || (req.session.user && req.body.userType != 'admin')) {//未登录者只能注册staff，管理员若请求注册非admin类型则为staff
                req.body.userType = 'staff';
            }
            var password = req.body.password;
            var password_re = req.body['password-repeat'];
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
                password: password,
                userType: req.body.userType,
                vehicleName: req.body.vehicleName,
                staffName: req.body.staffName,
                phoneNumber: req.body.phoneNumber
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
                    req.flash('success', '注册成功！');
                    if(!req.session.user)
                    {
                        req.session.user = newUser;//用户信息存入 session
                        return res.redirect('/');//注册成功后返回主页
                    }
                    else {
                        return res.redirect('/users');//注册成功后返回用户列表
                    }
                });
            });
        }
        else {
            req.flash('error', '已登录!');
            return res.redirect('back');
        }
    });

    app.get('/login', checkNotLogin);
    app.get('/login', function(req, res){
        res.render('login', {
            title: '登陆'
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
            req.flash('success', '登陆成功! 用户类型：'+user.userType);
            return res.redirect('/');
        });
    });

    app.get('/logout', checkLogin);
    app.get('/logout', function(req, res){
        req.session.user = null;
        req.flash('success', '登出成功!');
        return res.redirect('/');
    });

    app.get('/users', checkLogin);
    app.get('/users', function(req, res){
        if(req.session.user.userType == 'admin') {//如果是管理员，显示员工列表
            //查询所有用户
            User.getList('admin', function (err, admins) {
                if (!admins) {
                    req.flash('error', '查询不到!');
                    return res.redirect('/');//用户不存在则跳转到账号管理页
                }
                User.getList('staff', function (err, staffs) {
                    if (!staffs) {
                        req.flash('error', '查询不到!');
                        return res.redirect('/');//用户不存在则跳转到账号管理页
                    }
                    res.render('userlist', {
                        title: '员工列表',
                        admins: admins,
                        staffs: staffs
                    });
                });
            });

    }
        else {//如果是员工，跳转到个人url
            return res.redirect('users/' + req.session.user.username);
        }
    });

    app.get('/users/:username', checkLogin);//显示员工信息（如果是本人，还可以修改密码、修改信息）
    app.get('/users/:username', function (req, res) {
        if(req.session.user.username == req.params.username || req.session.user.userType == 'admin') {
            User.get(req.params.username, function (err, viewingUser) {
                if (!viewingUser) {
                    req.flash('error', '用户不存在!');
                    return res.redirect('/users');//用户不存在则跳转到账号管理页
                }
                res.render('userinfo', {
                    title: req.params.username,
                    viewingUser: viewingUser
                });
            });
        }
        else
            return res.redirect('users/' + req.session.user.username);
    });

    app.use(function (req, res) {
        res.render("404", {
            title: '没有找到该页面'
        });
    });

    //两个辅助函数
    function checkLogin(req, res, next) {
        if (!req.session.user) {
            req.flash('error', '未登录!');
            return res.redirect('/login');
        }
        next();
    }

    function checkNotLogin(req, res, next) {
        if (req.session.user) {
            req.flash('error', '已登录!');
            return res.redirect('back');
        }
        next();
    }

}





