var mongodb = require('./models/db');
var crypto = require('crypto');

var md5 = crypto.createHash('md5');
var password = md5.update('admin').digest('hex');

mongodb.open(function (err, db) {
    if (err) {
        return err;//错误，返回 err 信息
    }
    //读取 users 集合
    db.collection('users', function (err, collection) {
        if (err) {
            mongodb.close();
            return err;//错误，返回 err 信息
        }
        collection.update(
		    {username:'admin'},
		    {$set:{password:password, userType:'admin'}},
		    {upsert:true,safe:false},
		    function(err,data){
		        if (err){
		            console.log(err);
		        }else{
		            console.log("Inited a admin");
		        }
		    }
		);
    });
});