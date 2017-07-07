// 存放当前文章的信息
var articleData = {
	_id : null,
	title :　"文章标题",
	date : '日期',
	comments : "评论数",
	tag : "分类",
	labels : ["标签"], //标签
	content : "<h4>文章内容</h4>"
};
//存放状态
var SortStatus = {
	byComments:'other',
	byDate:'other'
};
//存放所有文章的信息
var allArticles = [];
//获取所有文章的信息
function getAllArticles(){
	$.ajax({
		url: '/manage/getAllArticles',
		type: 'POST',
		dataType: 'json',
	})
	.done(function(data) {
		allArticles = data;
		if(allArticles.length != 0){
			//对数组的date属性进行转化
			for(var i = 0;i<allArticles.length;i++){
				var date = new Date(Number(allArticles[i].date));
				allArticles[i].date = date.getFullYear() + '-' + date.getMonth() + "-" + date.getDay();
			}
		}
	})
	.fail(function() {
		console.log("error");
	})
	.always(function() {
		console.log("complete");
	});
	
}
//页面跳转函数
function editArticle(url){
	location.href=url;
}
//数组排序函数
function getSortFun(order, sortBy) {
    var ordAlpah = (order == 'asc') ? '>' : '<';
    var sortFun = new Function('a', 'b', 'return a.' + sortBy + ordAlpah + 'b.' + sortBy + '?1:-1');
    return sortFun;
}
//获取指定_id的文章的信息存放至articleData
function getArticleMes(id){
	$.ajax({
		url: '/manage/getArticleByid',
		type: 'POST',
		dataType: 'json',
		data :{id:id}
	})
	.done(function(data) {
		if( 'error' in data)
			alert(data.error);
		else if('result' in data){
			articleData = data.result;
			showArticle();
		}

	})
	.fail(function() {
		console.log("error");
	})
	.always(function() {
		console.log("complete");
	});
}
//预览文章
function showArticle(){
	var data = articleData;
	data.content = marked(data.content);
	var tpl = document.getElementById('tpl').innerHTML;	
	var html = juicer(tpl, data); 
	$('#article-context').html(html);
	$("html,body").animate({scrollTop:$("#main").offset().top},1000);
}
//重新渲染文章列表
function sortArticles(_data){
	var tpl = document.getElementById('sort').innerHTML;	
	var html = juicer(tpl, {"articles" : _data});	
	$('.article-list').html(html);
}
jQuery(document).ready(function($) {
	$('[data-toggle="tooltip"]').tooltip();
	showArticle();	
	getAllArticles();
	$("body").on("click",'.article-title',function(){
	 	var id = $(this).attr("name");
	 	getArticleMes(id);
	});
	$("body").on("click",'.edit-article',function(){
		if( articleData._id == null)
			return false;
	 	var id = articleData._id;
	 	var url = "edit/"+id;
	 	editArticle(url);
	});
	$("body").on("click",'.sortByTime',function(){
		//如果allArticles数组还没有数据，则请求加载
		if(allArticles.length == 0)
			return false;
		allArticles.sort(getSortFun(SortStatus.byComments,'date'));
		SortStatus.byComments = (SortStatus.byDate == 'asc')?'other' : 'asc';
		sortArticles(allArticles);
	});
	$("body").on("click",'.sortByComments',function(){
		//如果allArticles数组还没有数据，则请求加载
		if(allArticles.length == 0)
			return false;
		allArticles.sort(getSortFun(SortStatus.byComments,'comments'));
		SortStatus.byComments = (SortStatus.byComments == 'asc')?'other' : 'asc';
		sortArticles(allArticles);
	});
	$('body').on("click",".filter",function(){
		var tag = $(this).text();
		var dataArr = [];
		for(var i = 0;i<allArticles.length;i++){
			if(allArticles[i].tag == tag)
				dataArr.push(allArticles[i]);
		}
		sortArticles(dataArr);
	});
	//	删除一篇文章
	$('body').on("click","#delete-article",function() {
		if(articleData._id == null || articleData._id == "") {
			alert("请先选择一篇文章！");
			return false;
		}
		$.ajax({
			type: "post",
			url: "/manage/deleteArticleByid",
			data: { id : articleData._id },
			dataType: "json",
			success: function (data) {
				if( data.result == "1" ) {
					//	删除成功
					location.reload(true);
				}
				else {
					alert("出错了");
				}
			},
			error : function() {
				alert("无法发出请求");
			}
		});

	})
});