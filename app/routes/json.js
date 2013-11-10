var User = require('../models/user.js');

module.exports = function (req,res) {
    var cmd = req.body.cmd;
    if (typeof(eval(cmd))=="function"){
        cmd += '(req,res);'
        eval(cmd);
    }
    else
        console.log(cmd+ ' not exist');
}

var staffs = function(req, res) {
    if(req.session.user.userType == 'admin') {//如果是管理员，显示员工列表
    //查询所有用户
        User.getList('staff', function (err, staffs) {
            if (!staffs) {
                res.send(false);
            }
            res.send(staffs);
        });
    }
}

var searchStaff = function(req, res) {
    if(req.session.user.userType == 'admin') {//如果是管理员，显示员工列表
        //查询所有用户
        User.getList('staff', function (err, staffs) {
            if (!staffs) {
                res.send(false);
            }
            res.send([1,2,3,4,5]);
        });
    }
}

