
var express = require('express');
var router = express.Router();
var multer = require('multer');
var MongoClient = require('mongodb').MongoClient;
var objectId = require('mongodb').ObjectId;
var async = require('async');
var url = 'mongodb://127.0.0.1:27017';
var upload = multer({ dest: 'C:/tmp' });
var fs = require('fs');
var path = require('path');





//localhost:3000/brand
router.get('/', function(req, res, next) {
  //将用户列表给列出来。
  //操作数据库，mogodb
  //下载：npm install --save mogodb

  var page = parseInt(req.query.page) || 1;//前端传过来的页码
  var pageSize = parseInt(req.query.pageSize) || 3;//每页显示的条数
  var totalSize = 0;//总条数
  var data = [];

  //穿行无关联
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
        db.collection('brand').find().count(function(err,num){
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

        db.collection('brand').find().limit(pageSize).skip(page*pageSize-pageSize).toArray(function(err,data){
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
        res.render('brand',{
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

//注册操作localhost:3000/users/register
router.post('/register',function(req,res){
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
    db.collection('brand').deleteOne({
    _id:objectId(id)
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
        //res.send('<script>location.reload();</script>');
        res.redirect('/brand');
      }
      client.close();
    })
  })
})

// 新增品牌管理

router.post('/addbrand', upload.single('file'), function (req, res) {
  //console.log(req.file);
  // console.log(req.body);
  //如果想要通过浏览器访问到这张照片的话，是不是需要将图片放到public里面去
  var filename = 'phoneImg/' + new Date().getTime() + '_' + req.file.originalname;
  //new Date().getTime() + '_'这个是时间差问题，可以解决图片的重命名
  var newFileName = path.resolve(__dirname, '../public/', filename);
  //var newFileName = path.resolve(__dirname,'../public/phoneImg/', new Date().getTime() + '_' + req.file.originalname);
  try {
      //rename设置权限的有问题
      //fs.renameSync(req.file.path,newFileName);
      var data = fs.readFileSync(req.file.path);//先读进去，在写进去
      fs.writeFileSync(newFileName, data);
      //res.send('上传成功');
      //console.log(req.file);
      //console.log(req.body);
      //上传成功之后将操作的数距库写入
      MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) { 
          var db = client.db('project');
          db.collection('brand').insertOne({
            brandname:req.body.brandname,
              fileName: filename
          }, function (err) {
              res.send('新增品牌成功');
          })
      })

  } catch (error) {
      res.render('error', {
          message: '新增品牌失败',
          error: error
      })
  }
})
module.exports = router;
