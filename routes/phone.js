var express = require('express');
var router = express.Router();
var multer = require('multer');
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://127.0.0.1:27017';
var upload = multer({ dest: 'C:/tmp' });
var fs = require('fs');
var path = require('path');



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
            console.log(data);
            res.render('phone',{
                list:data
            });
            //关闭数据库
            client.close();
            //res.send()
        })
    })

    res.render('phone');
})


//新增手机
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
module.exports = router;
