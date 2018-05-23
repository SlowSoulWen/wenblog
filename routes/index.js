const Articles = require("../lib/mongo");
const Comments = require("../lib/mongo").comments;
const articlesTool = require("../lib/articlesTool").articlesTool;
const trimHtml = require('trim-html');
const async = require("async");
const recordIP = require('../middlewares/recordIP').recordIP;
const marked = require('marked');
const mailSend = require('../lib/mail').mailSend

marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: false
});

module.exports = function(app){
	app.use(require('body-parser')());
	app.use(function (req,res,next){
		res.locals.flash = req.session.flash;
		delete req.session.flash;
		next();
	}); 
	//访问首页
	app.get('/',recordIP,function (req,res,next) {
		Articles.articles.Paging(0).exec(function(err,articleData){
			if(err){
				console.log(err);
				next(err);				
			}
			let context = {
				articles : articleData.map(function(article){
					let date = new Date(Number(article.date));
					return {
						id :  article._id,
					    title: article.title,
					    content:trimHtml(marked(article.content),{limit: 100}).html,  
					    date:date.toLocaleDateString(),
					    comments:article.comments.length,
					    labels:article.labels,
					    tag:article.tag						
					}
				})
			};
			console.log(typeof articles)
			var Page = {
				next : ( articleData.length == 5 ) ? 2 : null,
				prev : null
			};
			res.render('index',{context:context,page:Page});
		});
	});
	//主页分页
	app.get('/page/:page',recordIP,function (req,res,next){
		let page = Number(req.params.page);
		let pageNum = ( page - 1 ) * 5;
		Articles.articles.Paging(pageNum).exec(function(err,articleData){
			if(err){
				console.log(err);
				next(err);				
			}
			if(articleData.length === 0)
				next();
			let context = {
				articles : articleData.map(function(article){
					let date = new Date(Number(article.date));
					return {
						id :  article._id,
					    title: article.title,
					    content:trimHtml(marked(article.content),{limit: 100}).html,
					    date:date.getMonth() + "月" + date.getDay() + "日," + date.getFullYear(),
					    comments:article.comments.length,
					    labels:article.labels,
					    tag:article.tag						
					}
				})
			};
			let Page = {};
			if(page > 1)
				Page.prev = page - 1;
			Page.next = page + 1;
			res.render('index',{context:context,page:Page});
		});
	});
	//访问指定文章页面
	app.get('/article/:id',recordIP,function (req,res,next){
		let id = req.params.id;
		Articles.articles.searchById(id).exec(function(err,data){
			data.content = marked(data.content); 
			if( err ){
				throw err;
			}
			data.date = (new Date(Number(data.date))).toLocaleDateString();
			res.render('article',{
				articleData : data,
				commentsData : data.comments
			});	
		});
	});
	//获取指定_id文章的所有评论
	app.post('/getCommentsById',function (req,res,next){
		let id = req.body.id;
		Comments.getArticleComments(id).exec(function(err,commentsData){
			if(err){
				console.log("查询评论出错了: " + err);
				return res.json({
					error : "查询出错了"
				});	
			}
			else
				return res.json({
					result : commentsData
				});											
		});
	});
	//访问分类页
	app.get('/classification/:tag?/:label?',recordIP,function (req,res,next){
		Articles._article.find({},['tag','labels'],function(err,articleData){
			if(err){
				console.log("查询出错:" + err);
				return false;
			}	
			var menuData = articlesTool.filterTags(articleData);
			console.log(menuData);
			var tag = req.params.tag || menuData[0].tag;
			var label = req.params.label || null;
			for(var i in menuData){
				if(menuData[i].tag == tag)
					menuData[i].active = true;
			}
			if( tag ) {
				if(label){
					var condition = {tag:tag,labels:(label)}
				}else{
					var condition = {tag:tag}
				}
				Articles._article.find(condition,function(err,articles){
					var articlesData = articles.map(function(article){
						let date = new Date(Number(article.date));
						return {
							id :  article._id,
							title: article.title,
							content:trimHtml(marked(article.content), {limit: 100}).html,  
							date:date.toLocaleDateString(),
							comments:article.comments.length,
							labels:article.labels,
							tag:article.tag						
						}
					});
					res.render('classification',{
						menuData : menuData,
						articles : articlesData
					});
				}).sort({date:-1})
			}
		}).sort({date : -1});			
	});

	//	访问归档页
	app.get("/archiving",recordIP,function(req,res,next) {	
		Articles._article.find({},['title','date','_id']).sort({"date":-1}).exec(function(err,data) {
			var articleList = {};
			data.forEach(function(ele){
				ele.date = (new Date(Number(ele.date))).toLocaleDateString();
				var year = (ele.date).toString().split("-")[0];
				if(!(year in articleList)) {
					articleList[year] = [];
				}
				articleList[year].push(ele);
			});
			res.render('archiving',{articleList:articleList});
		});
	});

	//	访问关于页面
	app.get("/about",recordIP,function(req,res,next) {
		res.render('about');
	});

	//添加一条评论
	app.post('/addComment',function(req,res){
		req.body.data.cdate = (new Date().getTime()).toString();
		req.body.data._id = (new Date().getTime()).toString();
		var Data = req.body.data;
		Comments.addComment(Data).exec(function(err,data) {
			if(err) {
				res.json({
					result : -1  
				});
				throw err;
			}
			data.comments.push({
				id : Data._id,
				context : Data.context,
				cdate : Data.cdate,
				reply : Data.reply,
				rid : Data.rid,	
				name : Data.name, 
				trueName : Data.trueName,
				email : Data.email,
				personalWeb : Data.personalWeb,	
				rname : Data.rname,
				rcontext : Data.rcontext	
			});
			data.save(function(err){
				if(err){
					res.json({
						result : -1  
					});
					throw err;
				}
				// 如果此条评论是回复他人，判断是否需要发送邮件通知
				if (Data.reply && Data.rid) {
					let comments = data.comments
					let replyComment = comments.find((comment) => {
						return comment.id === Data.rid
					})
					if (replyComment.email) {
						// 如果被回复人有留邮箱，发送邮件通知
						Articles.articles.searchById(Data.article_id).exec(function(err,data){
							let blogTitle = data.title
							mailSend(replyComment.email, 'Slow_Soul的博客留言回复通知', `Hi!${replyComment.name}: <br/> 有人在我的博客《${blogTitle}》中回复了你的留言，快去看看吧！<a href="http://www.wenguangblog.cn/article/${Data.article_id}">点击查看博客</a> <br/> 你的留言内容：${replyComment.context} <br/> 回复内容：${Data.context}`)
						})
					}
				}
				// 通知自己，收到新留言
				Articles.articles.searchById(Data.article_id).exec(function(err,data){
					let blogTitle = data.title
					mailSend('298172208@qq.com', '博客留言通知', `有人在我的博客《${blogTitle}》中留言了 <br/> 留言内容：${Data.context}`)
				})
				res.json({
					result : 1  
				});
			});
		});
	});

	// 访问后台
	app.use('/manage',recordIP,require("./manage"));


	// 404
	app.use(function (req,res){
		res.status(404);
		res.render('404',{layout : null});
	});

	// 500
	app.use(function (err,req,res) {
		res.type('text/plain');
		res.status(500);
		res.send('500 - server error');
	});
}

//	处理评论数据
function dealWithComments(data) {
	let commentsData = data;
	for( let i = 0; i < commentsData.length; i++){
		if( commentsData[i].reply == 1){
			for( let j = 0;j < commentsData.length; j++){
				if(commentsData[j]._id == commentsData[i].rid){
					commentsData[i].rMes = commentsData[j];	
					break;
				}
			}
		}
	}
	return commentsData;
}
