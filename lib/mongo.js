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
//	文章表
var article = new mongoose.Schema({
	_id :String,
    title: String,
    content: String,
    date: String,
    comments:Array,
    labels:[String],
    tag:String
});  
var Article = mongoose.model('Article',article);
exports._article = Article;
exports.articles = {
	//新增一篇文章
	create : function create(obj){
		new	Article({
			_id : obj._id,
		    title : obj.title,
		    content : obj.content,
		    date : obj.date,
		    comments : [],
		    labels : obj.labels,
		    tag : obj.tag	
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
	},
	//删除一篇文章
	removeArticle : function(id) {
		return Article.remove({_id:id});
	}
};
exports.comments = {
	//插入一条留言
	addComment : function(Data){	
		return Article.findOne({_id : Data.article_id});	
	},
	//查询一篇文章的所有留言
	getArticleComments : function(id){
		return Article.find({_id:id},['comments']);
	}
}