var express = require('express');
var router = express.Router();
var checkLogin = require('../middlewares/check').checkLogin;
var checkNotLogin = require('../middlewares/check').checkNotLogin;
var article = require("../lib/mongo").articles;

// 访问后台管理界面 /manage
router.get('/',checkLogin,function (req,res) {
	res.render('backStageManagement',{layout : "manage"});
});

//访问后台登录页 /manage/signin
router.get('/signin',checkNotLogin,function (req,res){
	res.render('login', { layout : null });
});	

// 后台登录 
router.post('/signin',checkNotLogin,function (req,res){	
	// 获取账号密码
	var account = req.body.account || "";
	var password = req.body.password || "";
	console.log("账号:" + account + " 密码:"+ password);
	// 后台表单验证不通过
	if(account == "" || password == ""){
		//是ajax异步请求
		if(req.xhr){
			return res.json({
				error : "账号或密码为空！"
			});
		}
		//是浏览器请求
		req.session.flash = {
			type : 'danger',
			intro : "表单验证失败",
			message : "账号或密码为空！"
		}
		return res.redirect(303,'/manage/signin');
	}
	//账号或密码错误
	else if(account != 'wenguang' ||  password != "123"){
		//是ajax异步请求
		if (req.xhr) {
			return res.json({error : "账号或密码错误！"});
		}
		//是浏览器请求
		req.session.flash = {
			type : 'danger',
			intro : "身份有误",
			message : "账号或密码错误！"
		}
		return res.redirect(303,'/manage/signin');			
	}
	// 验证通过
	else if(account == 'wenguang' && password == "123"){
		req.session.admin = account;
		//是ajax异步请求
		if (req.xhr) {
			return res.json({
				success : "success",
				url : '/manage'
			});
		}
		//是浏览器请求
		return res.redirect(303,'/manage/');		
	}
});

// 写博客页面 manage/edit
// router.get('/edit',checkLogin,function (req,res){
// 	console.log("GET /edit")
// 	res.render('backStageManagement',{layout : "manage"});
// });

//新增博客
router.post('/addArticle',checkLogin,function (req,res){
	console.log("POST /addArticle");
	var data = req.body.data;
	var title = data.title;       //标题
  	var content = data.content;   //正文
  	var labels = data.labels;	  //标签
  	var tag = data.tag;			  //分类
  	if(title && content && labels && tag){
  		var time = new Date();
		var date = time.getTime(); 	//日期时间毫秒数
  		var _id = date + Math.random().toString(36).substr(2).slice(1,4);	  //id
		var result = article.create({
			_id : _id,
			title : title,
			content : content,
			labels : labels,
			tag : tag,
			date : date
		});
		if(req.xhr){
			return res.json({
				result : result
			});			
		}
  	}
});

//GET 访问文章修改页
router.get('/edit/:postId',checkLogin,function (req,res){
	res.render("backStageManagement",{layout : "manage"});
});

//POST 请求获取指定_id的文章
router.post('/getArticleByid',checkLogin,function (req,res){
	var id = req.body.id;
	if(id == ""){
		return res.json({
			error : "id为空"
		});		
	}
	article.searchById(id).exec(function(err,result){
		if(err){
			console.log("查询错误: " + err);
			return res.json({
				error : "数据库查询出错"
			});
		}
		return res.json({result});	
	});	
});

//GET 访问文章管理页面
router.get('/managearticles',checkLogin,function (req,res){
	article.searchTitleAndId().exec(function(err,result){
		var tagArr = [];
		for( var i = 0;i<result.length;i++){
			if(tagArr.indexOf(result[i].tag) == -1){
				tagArr.push(result[i].tag);
			}
			var date = new Date(Number(result[i].date));
			result[i].date = date.toLocaleDateString();		
		}
		res.render("manageArticles",{layout:"manage",articles:result,tagArr:tagArr});
	});
});

//POST 请求所有文章的标题,日期,评论数和_id
router.post('/getAllArticles',checkLogin,function (req,res){
	article.searchTitleAndId().exec(function(err,result){
		if(err){
			console.log(err);
			return res.json({
				error : err
			});
		}
		return res.json(result);
	});
});

//POST 修改一篇文章
router.post('/editArticle',checkLogin,function (req,res){
	var data = req.body.data;
	data.lastEdit =  (new Date()).getTime();
	var id = data._id;
	article.updateArticle(data,id).exec(function(err,result){
		if(err){
			console.log(err);
			return res.json({
				error : "数据库查询出错"
			});
		}
		if(result['ok'] == 1)
			return res.json({
				'result' : "更新成功！"
			});	
		else{
			return res.json({
				'result' : "更新出错！"
			});				
		}	
	});
});

//POST 删除文章
router.post('/deleteArticleByid',checkLogin,function(req,res,next){
	var id = req.body.id;
	if( id ) {
		article.removeArticle(id).exec(function(err,result) {
			console.log(result);
			if(err){
				console.log(err);
				return res.json({
					error : "数据库查询出错"
				});
			}
			if(result.result['ok'] == 1)
				return res.json({
					'result' : "1"
				});	
			else{
				return res.json({
					'result' : "-1"
				});				
			}		
		})
	}
	else {
		return res.json({
			error : "未传入文章id"
		});	
	}
});

//POST 重新放回草稿箱
// router.post('/returndrafts/:postId',checkLogin,function(req,res,next){

// });

module.exports = router;