var express = require('express');
var router = express.Router();
// var path = require('path');
// var bodyParser = require('body-parser');

// app.use(bodyParser.urlencoded({extended:false}));
// app.use(bodyParser.json());

/* GET home page. */
//首页
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });//{ title: 'Express' }这个是传的值
});

// 登录页面
router.get('/login.html',function(req,res,next){
  res.render('login');
});




// 注册页面
router.get('/reginest.html',function(req,res){
  res.render('reginest');
});



// 用户的跳转
// router.get('/users.html',function(req,res){
// res.render('users');
// });

// 品牌的跳转
router.get('/brand.html',function(req,res){
  res.render('brand');
});
// 手机的跳转
router.get('/phone.html',function(req,res){
  res.render('phone');
});

module.exports = router;
