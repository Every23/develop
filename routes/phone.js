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

//手机操作localhost:3000/phone
router.get('/', function(req, res, next) {
    //res.send('respond with a resource');
    //将用户列表给列出来。
    //操作数据库，mogodb
    //下载：npm install --save mogodb
  
    var page = parseInt(req.query.page) || 1;//前端传过来的页码
    var pageSize = parseInt(req.query.pageSize) || 5;//每页显示的条数
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
          db.collection('phone').find().count(function(err,num){
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
  
          db.collection('phone').find().limit(pageSize).skip(page*pageSize-pageSize).toArray(function(err,data){
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
          res.render('phone',{
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


//手机管理页面
router.get('/', function (req, res) {
    MongoClient.connect(url,{useNewUrlParser:true},function(err,client){
        //链接数据库
        if(err){
            res.render('error',{
                message:'链接失败',
                error:err
            })
            return;
        }

        var db = client.db('project');
        db.collection('phone').find().toArray(function(err,data){
            if(err){
                res.render('error',{
                    message:'失败',
                    error:err
                })
                return;
            }
         
            res.render('phone',{
               list:data
            });
            //关闭数据库
           client.close();
            //res.send()
        })
        
    })

    // res.render('phone');
})


//新增手机的文件//upload是上传图片的意思
router.post('/addPhone', upload.single('file'), function (req, res) {
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
            db.collection('phone').insertOne({
                brandOnly:req.body.brandOnly,
                phonePrice: req.body.phonePrice,
                twoPrice:req.body.twoPrice,
                phoneName: req.body.phoneName,
                fileName: filename
            }, function (err) {
                res.send('新增手机成功');
            })
        })

    } catch (error) {
        res.render('error', {
            message: '新增手机失败',
            error: error
        })
    }
})

//localhost:3000/phone
router.get('/phone', function(req, res, next) {
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
          db.collection('phone').find().count(function(err,num){
            if(err){
              cb(err);
            }else{
              totalSize = num;
              cb(null);
            }
          })
        },
        function(cb){
          db.collection('phone').find().limit(pageSize).skip(page*pageSize-pageSize).toArray(function(err,data){
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
          res.render('phone',{
            list: results[1],
            totalPage: totalPage,
            pageSize: pageSize,
            currentPage: page  
          })
        }
      })
    })
  });


//删除操作localhost:3000/phone/delete
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
      db.collection('phone').deleteOne({
      _id:objectId(id)
      },function(err,data){
        console.log(data);
        if(err){
          res.render('error',{
            message:'删除失败',
            error:err
          })
        }else{
          //删除失败，页面刷新一下
          res.redirect('/phone');
        }
        client.close();
      })
    })
  })


module.exports = router;
