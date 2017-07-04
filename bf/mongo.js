var config = require('config-lite');
var mongoose = require('mongoose');
var express = require('express');
var app = express();
var opts = {
	server : {
		socketOptions : {keepAlive : 1}
	}
};
switch(app.get('env')){
	case "development" :
		mongoose.connect(config.mongodb.development.connection,opts);
		break;
	case "production" : 
		mongoose.connect(config.mongodb.development.production,opts);
		break;
	default : 
		throw new Error("未知开发环境 : " + app.get('env'));
}
//文章表
var article = new mongoose.Schema({
	_id :String,
    title: String,
    content: String,
    date: String,
    comments:Number,
    labels:[String],
    tag:String
});  
//评论表
var comment = new mongoose.Schema({
	_id : String,      //评论的id
	context : String,  //评论内容
	cdate : String,    //评论时间
	reply : Number,    //是否是回复(是:1,否:0)
	rid : String,	   //回复的评论的所属id
	name : String,	   //昵称
	article_id : String, //评论所属的文章的id
	trueName : String,   // 真实姓名
	email : String,      // 邮箱
	personalWeb : String  //个人网站
});
var Article = mongoose.model('Article',article);
var Comment = mongoose.model('comment',comment);
exports._comment = Comment;
exports._article = Article;
exports.articles = {
	//新增一篇文章
	create : function create(obj){
		new	Article({
			_id : obj._id,
		    title: obj.title,
		    content:obj.content,
		    date: obj.date,
		    comments:obj.comments,
		    labels:obj.labels,
		    tag:obj.tag	
		}).save(function(err,result){
			if(err){
				console.log(err);
				return false;
			}
			else 
				return true;
		});
	},
	//分页：查询指定页数的文章
	Paging : function Paging(pagNum){
		return 	Article.find().skip(pagNum).limit(5).sort({"date":-1});
	},
	//以_id查询一篇文章
	searchById : function searchById(id){
		return Article.findOne({_id : id});
	},
	//查询所有文章的标题,日期,评论数和_id
	searchTitleAndId : function searchAllArticlesTitleAndId(){
		return Article.find({},['title','date','comments','_id','tag']);
	},
	//通过_id更新一篇文章
	updateArticle : function updateArticle(obj,id){
		return Article.update({_id:id},obj);
	}
};
exports.comments = {
	//插入一条留言
	addComment : function(data){	
		new	Comment({
			_id : data._id,
			context : data.context,
			cdate : data.cdate,
			reply : data.reply,
			rid : data.rid,	
			name : data.name, 
			trueName : data.trueName,
			email : data.email,
			personalWeb : data.personalWeb,	
			article_id : data.article_id		
		}).save(function(err,result){
			if(err){
				console.log(err);
			}
			else 
				console.log("留言存入成功！");
		});		
	},
	//查询一篇文章的所有留言
	getArticleComments : function(id){
		return Comment.find({article_id:id},['_id','context','cdate','reply','rid','name']);
	}
}