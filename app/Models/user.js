var mongodb = require('./db');

function User(user) {
    this.username = user.username;
    this.password = user.password;
    this.userType = user.userType;
    this.vehicleName = user.vehicleName,
    this.staffName = user.staffName,
    this.phoneNumber = user.phoneNumber
};

module.exports = User;

//存储用户信息
User.prototype.save = function(callback) {
    //要存入数据库的用户文档
    if(this.userType == 'admin') {
        var user = {
            username: this.username,
            password: this.password,
            userType: this.userType
        };
    }
    else {
        var user = {
            username: this.username,
            password: this.password,
            userType: this.userType,
            vehicleName: this.vehicleName,
            staffName: this.staffName,
            phoneNumber: this.phoneNumber
        };
    }

    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);//错误，返回 err 信息
        }
        //读取 users 集合
        db.collection('users', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);//错误，返回 err 信息
            }
            //将用户数据插入 users 集合
            collection.insert(user, {safe: true}, function (err, user) {
                mongodb.close();//关闭数据库
                callback(null, user[0]);//成功！err 为 null，并返回存储后的文档
            });
        });
    });
};

//读取用户信息
User.get = function(username, callback) {
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);//错误，返回 err 信息
        }
        //读取 users 集合
        db.collection('users', function (err, collection) {
            if (err) {
                mongodb.close();//关闭数据库
                return callback(err);//错误，返回 err 信息
            }
            //查找用户名（username键）值为 username 一个文档
            collection.findOne({
                username: username
            }, function(err, user){
                mongodb.close();//关闭数据库
                if (user) {
                    return callback(null, user);//成功！返回查询的用户信息
                }
                callback(err);//失败！返回 err 信息
            });
        });
    });
};

User.getList = function(userType, callback) {
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);//错误，返回 err 信息
        }
        //读取 users 集合
        db.collection('users', function (err, collection) {
            if (err) {
                mongodb.close();//关闭数据库
                return callback(err);//错误，返回 err 信息
            }
            var query = {};
            if (userType) {
                query.userType = userType;
            }
            //查找用户名（username键）值为 username 一个文档
            collection.find(query).toArray(function(err, users){
                mongodb.close();//关闭数据库
                if (users) {
                    return callback(null, users);//成功！返回查询的用户信息
                }
                callback(err);//失败！返回 err 信息
            });
        });
    });
};