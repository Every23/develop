var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var async = require('async');
var router = express.Router();
var url = 'mongodb://127.0.0.1:27017';


//localhost:3000/users
router.get('/', function(req, res, next) {
  //res.send('respond with a resource');
  //将用户列表给列出来。
  //操作数据库，mogodb
  //下载：npm install --save mogodb

  var page = parseInt(req.query.page) || 1;//前端传过来的页码
  var pageSize = parseInt(req.query.pageSize) || 3;//每页显示的条数
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
        //数据库 //limit() //skip()

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
      //results这个地方是个数组,[undefined,data]
      if(err){
        res.render('error',{
          message:'错误',
          error:err
        })
      }else{
        var totalPage = Math.ceil(totalSize/pageSize);//向上取整总的页数
        res.render('users',{
          list: results[1],
         // list:data
        //  totalSize:totalSize,
        totalPage: totalPage,
        pageSize: pageSize,
         currentPage: page

        })
      }
    })
  })

  // MongoClient.connect(url,function(err,client){
  //   if(err){
  //     //链接数据库失败
  //     console.log('链接数据库失败',err);
  //     res.render('error',{
  //       message:'链接数据库失败',
  //       error:err
  //     });
  //     return;
  //   }
  //   var db = client.db('project');

  //   db.collection('user').find().toArray(function(err,data){
  //     if(err){
  //       console.log('查询用户数据失败',err);
  //       //有错误，渲染error.ejs
  //       res.render('error',{
  //         message:'查询失败',//message前端页面可以渲染一下错误
  //         error:err
  //       })
  //     }else{
  //       console.log(data);
  //       res.render('users',{
  //         list:data
  //       });
  //     }
  //     //关闭数据库的链接
  //     client.close();
  //   })
  // });
 // res.render('users');
});



// 搜索
router.get("/seek", function (req, res) {
  var seekl = req.query.seek;
  var seek = new RegExp(seekl);
  var page = parseInt(req.query.page || 1); //前端传过来的页码
  var pageSize = parseInt(req.query.pageSize || 3); //每页显示的条数
  var totalSize = 0; //总条数 需要自己查询数据库
  MongoClient.connect(url, {
    useNewUrlParser: true
  }, function (err, client) {
    if (err) {
      res.render("error", {
        message: "连接数据库失败",
        error: err
      })
      return;
    }
    var db = client.db("project");
    async.series([function (cb) {
      db.collection("user").find({
        nickname: seek
      }).count(function (err, num) {
        if (err) {
          cb(err);
        } else {
          totalsize = num;
          cb(null);
        }
      })
    }, function (cb) {
      console.log(seek)
      var index = page * pageSize - pageSize;
      var pageSize = parseInt(req.query.pageSize || 3); //每页显示的条数
      db.collection("user").find({
        nickname: seek
      }).toArray(function (err, data) {
        if (err) {
          cb(err);
        } else {
          cb(null, data);
        }
      })
    }], function (err, result) {
      if (err) {
        res.render("err", {
          message: "查询错误",
          error: err
        })
      } else {
        var totalPage = Math.ceil(totalSize / pageSize); //向上取整
        res.render("users", {
          list: result[1],
          totalPage: totalPage,
          pageSize: pageSize,
          currentPage: page
        })
        client.close()
      }
    })
  })
})


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

    // db.collection('user').find({
    //     username:username,
    //     password:password
    //   }).count(function(err,num){//count查询条数
    //   if(err){
    //     console.log('查询失败',err);
    //     res.render('error',{
    //       message:'查询失败',
    //       error:err
    //   })
    // }else if(num > 0){
    //   //登录成功-跳转到首页
    //   //res.render('index');

    //   //注意，当前url地址是http://localhost:3000/users/login。如果直接使用render（），页面地址是不会改变

    //   //登录成功，写入cookie
    //   res.cookie('nickname',)

     //  res.redirect('http://localhost:3000/');//res.redirect这个是要跳转的页面
    //   //res.redirect('/');

    // }else{
    //   //登录失败
    //   res.render('error',{
    //     message:'登录失败',
    //     error:new Error('登录失败')
    //   })
    // }
    // client.close();
    // })
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
//  //res.send('');//注意这里，因为MongoDB的操作时异步操作代码先执行这一句所以，上面的就没有执行
});

//注册操作localhost:3000/users/register
router.post('/register',function(req,res){
  var name = req.body.name;
  var pwd = req.body.pwd;
  var nickname = req.body.nickname;
  var age = parseInt(req.body.age);
  var sex = req.body.sex;
  var isAdmin = req.body.isAdmin === '是' ? true:false;
  // console.log(name,pwd,age,sex,isAdmin);
  // res.send('');

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
  // MongoClient.connect(url,{useNewUrlParser:true},function(err,client){
  //   if(err){
  //     res.render('error',{
  //       message:'链接失败',
  //       error:err
  //     })
  //     return;
  //   }
  //   var db = client.db('project');
  //   db.collection('user').insertOne({
  //     username:name,
  //     password:pwd,
  //     nickname:nickname,
  //     age:age,
  //     sex:sex,
  //     isAdmin:isAdmin
  //   },function(err){
  //     if(err){
  //       console.log('注册失败');
  //       res.render('注册失败',{
  //         message:'注册失败',
  //         error:err
  //       })

  //     }else{
  //       //注册成功 跳转到登录页面
  //       res.redirect('/login.html');
  //     }
  //     client.close();
  //   })
  // })
})

//删除操作localhost:3000/users/delete
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
        //删除失败，页面刷新一下
        //res.reload nodejs
        //location.reload();//没有reload的方法
        //res.redirect('/users');
        //res.send('<script>location.reload();</script>');
        res.redirect('/users');
      }
      client.close();
    })
  })
})
module.exports = router;
