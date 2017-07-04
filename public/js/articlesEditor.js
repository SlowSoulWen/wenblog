// 文章预览数据
var data = {
	title :　"文章标题",
	date : '日期',
	comments : "评论数",
	tag : "分类",
	labels : ["标签"], //标签
	content : "<h4>文章内容</h4>"
}
//预加载数据
function addFirstData(data){
	 $('.title-data').val(data.title);
	 $('.classification-data').val(data.tag);
	 var labelsStr = " ";
	 for(var i = 0;i<data.labels.length;i++){
		labelsStr += (data.labels[i] + " ");
	 }
	 $('.label-data').val(labelsStr);
	 $('#summernote').summernote('code', data.content);
}
//预览文章
function showArticle(){
	var tpl = document.getElementById('tpl').innerHTML;	
	var html = juicer(tpl, data); 
	$('#main').html(html);
}
// 获取文章的数据
function getArticleData(){
	var title = $('.title-data').val();
	var classification = $('.classification-data').val();
	var label = $('.label-data').val().trim();
	var markupStr = $('#summernote').summernote('code');
	var addClassification =  $('.add-classification-data').val();
	if(title =="" || classification == "" || label == "" || markupStr =="" || (classification == "选择类别" && addClassification == "")){
		alert("填写完整相关信息！");
		return false;
	}
	data.title = title;
	data.tag = (classification == "选择类别"?addClassification : classification);
	data.labels = (label.split(" "));
	data.content = markupStr;
}
//ajax新增一篇文章
function addArticle(url){
	getArticleData();
	$.ajax({
		url: url,
		type: 'POST',
		dataType: 'json',
		data:{ data : data},
	})
	.done(function(data) {
		alert(data.result);
		location.href='/manage/managearticles';
	})
	.fail(function() {
		console.log("error");
	})
	.always(function() {
		console.log("complete");
	});
}
$(document).ready(function() {
    $('#summernote').summernote();
    var urlArry = (window.location.href).split('/');
    var postId = urlArry[urlArry.length-1];
    //如果postId存在则说明是修改文章，执行数据预加载
    if(postId != ""){
    	var _data = { "id" : postId};
    	$.ajax({
    		url: '/manage/getarticlebyid',
    		type: 'POST',
    		dataType: 'json',
    		data:_data
    	})
    	.done(function(Data) {
    		addFirstData(Data.result);
    		data = Data.result;
			getArticleData();
			showArticle();
    	})
    	.fail(function() {
    		console.log("error");
    	})
    	.always(function() {
    		console.log("complete");
    	});
    }else{
    	showArticle();
    }

	//预览文章
	$('.read-atricle').click(function(event) {
		getArticleData();
		showArticle();
		$("html,body").animate({scrollTop:$("#main").offset().top},1000);
	});

	//确认上传
	$('.add-article').click(function(event){
		getArticleData();
		// 通过data对象中是否有_id属性判断是新增还是修改
		if("_id" in data){
			addArticle('/manage/editArticle');
		}else{
			addArticle('/manage/addArticle');
		}
	});
});	