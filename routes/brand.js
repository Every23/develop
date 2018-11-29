var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var async = require('async');
var router = express.Router();

var url = 'mongodb://127.0.0.1:27017';
//localhost:3000/users
router.get('/', function(req, res, next) {
  //将用户列表给列出来。
  //操作数据库，mogodb
  //下载：npm install --save mogodb

  var page = parseInt(req.query.page) || 1;//前端传过来的页码
  var pageSize = parseInt(req.query.pageSize) || 5;//每页显示的条数
  var totalSize = 0;//总条数
  var data = [];

  //串行无关联
  MongoClient.connect(url,{useNewUrlParser:true},function(err,client){
    if(err){
      res.render('error',{
        message:'链接失败',
        error:err
      })
      return;
    }
    var db = client.db('project');
    async.series([
      function(cb){
        db.collection('user').find().count(function(err,num){
          if(err){
            cb(err);
          }else{
            totalSize = num;
            cb(null);
          }
        })
      },
      function(cb){
        db.collection('user').find().limit(pageSize).skip(page*pageSize-pageSize).toArray(function(err,data){
          if(err){
            cb(err);
          }else{
           // data = data;
            cb(null,data);
          }
        })
      }
    ],function(err,results){ 
      if(err){
        res.render('error',{
          message:'错误',
          error:err
        })
      }else{
        var totalPage = Math.ceil(totalSize/pageSize);//向上取整总的页数
        res.render('users',{
            list: results[1],
            totalPage: totalPage,
            pageSize: pageSize,
            currentPage: page

        })
      }
    })
  })
});



//登录操作 localhost:3000/users/login
router.post('/login',function(req,res){
  //1,获取前端传递过来的参数
  var username = req.body.name;
  var password = req.body.pwd;
  //2，验证参数的有效性
  if(!username){
    res.render('error',{
      message:'用户名不能为空',
      error:new Error('用户名不能为空')
    })
    return;
  }
  if(!password){
    res.render('error',{
      message:'密码不能为空',
      error:new Error('密码不能为空')
    })
    return;
  }
 
  //3，链接数据库做验证
  MongoClient.connect(url,{useNewUrlParser:true},function(err,client){
    if(err){
      console.log('链接失败',err);
      res.render('error',{
        message:'链接失败',
        error:err
      })
      return;
    }
    var db = client.db('project');
    db.collection('user').find({
      username:username,
      pressword:password
    }).toArray(function(err,data){
      if(err){
        console.log('查询失败',err);
        res.render('error',{
          message:'查询失败',
          error:err
        })
      }else if(data.length <= 0){
        //没找到，登录失败
        res.render('error',{
          message:'登录失败',
          error:new Error('登录失败')
        })
      }else{
        //登录成功

        //cookie
        res.cookie('nickname',data[0].nickname,{
          maxAge:60 * 60 *1000//这个是毫秒单位
        });
        res.redirect('/');
      }
      client.close();
    })
  })
});

//注册操作localhost:3000/users/brand
router.post('/brand',function(req,res){
  var name = req.body.name;
  var pwd = req.body.pwd;
  var nickname = req.body.nickname;
  var age = parseInt(req.body.age);
  var sex = req.body.sex;
  var isAdmin = req.body.isAdmin === '是' ? true:false;

MongoClient.connect(url,{useNewUrlParser:true},function(err,client){
  if(err){
    res.render('error',{
      message:'链接失败',
      error:err
    })
    return;
  }
  var db = client.db('project');
  async.series([
    function(cb){
      db.collection('user').find({username:name}).count
      (function(err,num){
        if(err){
          cb(err)
        }else if(num > 0){
          //这个人已经注册过
          cb(new Error('已经注册'));
        }else{
          //可以注册
          cb(null);
        }
      })
    },
function(cb){
  db.collection('user').insertOne({
    username:name,
    password:pwd,
    nickname:nickname,
    age:age,
    sex:sex,
    isAdmin:isAdmin
  },function(err){
    if(err){
      cb(err);
    }else{
      cb(null);
    }
  })
}
  ],function(err,result){
    if(err){
      res.render('error',{
        message:'错误',
        error:err
      })
    }else{
      res.redirect('/login.html');
    }
    //不管成功与失败
    client.close();

  })
})
})

//删除操作localhost:3000/brand/delete
router.get('/delete',function(req,res){
  var id = req.query.id;
  MongoClient.connect(url,{useNewUrlParser:true},function(err,client){
    if(err){
      res.render('error',{
        message:'链接失败',
        error:err
      })
      return;
    }
    var db = client.db('project');
    db.collection('user').deleteOne({
    _id:ObjectId(id)
    //_id:id
    },function(err,data){
      console.log(data);
      if(err){
        res.render('error',{
          message:'删除失败',
          error:err
        })
      }else{
        res.redirect('/users');
      }
      client.close();
    })
  })
})
module.exports = router;
