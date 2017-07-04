var commentData = {
	reply : 0 
	//存放要上传的留言
	//article_id : 对应的文章id
	//reply : "null" (是否是回复,null为不是,是回复则传入id号)
	//context : 留言内容
	//name : 昵称
	//trueName : 真实姓名
	//email : 邮箱
	//personalWeb : 个人网站
};
//前往添加留言区
function toAddComment(){
	$("html,body").animate({scrollTop:$("#addComment").offset().top},1000);	
}
//获取留言信息
function getCommentMes(){
	var urlArry = (window.location.href).split('/');
	commentData.article_id = urlArry[urlArry.length-1].split('?')[0].split("#")[0];
	commentData.context = $('#comment-context').val();
	commentData.name = $('.userName').val();
	commentData.trueName = $('.trueName').val() || null;
	commentData.email = $('.email').val() || null;
	commentData.personalWeb = $('.personalWeb').val() || null;
}
$(document).ready(function() {
	//点击回复评论
	$('.reply-btn').click(function(){
		var obj = $(this).parent().parent();
		var name = obj.attr('data-name');
		commentData.reply = 1;
		commentData.rid = obj.attr('data-id');
		commentData.rname = obj.attr('data-name');
		commentData.rcontext = obj.attr('data-context');
		$('.tishi').text("回复 @" + name + " 的留言:");
		$('.replyComment').fadeIn(200);
		toAddComment();
	});
	
	//点击取消回复
	$('.cansle-reply').click(function(){
		commentData.rid = null;
		commentData.reply = 0;
		commentData.rname = null;
		commentData.rcontext = null;
		$('.replyComment').fadeOut(200);
	});

	//前往添加留言区
	$(".toAddComment").click(function(){
		toAddComment();
	});

	//点击确认发布
	$('.add-comment').click(function(){
		getCommentMes();
		if(commentData.context == "" || commentData.name == ""){
			alert("请将表单填写完整!");
			return false;
		}
		console.log(commentData);
		$.ajax({
			url: '/addComment',
			type: 'POST',
			dataType: 'json',
			data: {data:commentData},
		})
		.done(function(data) {
			console.log(data);
			if(data.result == 1) {
				//	留言成功
				$("#message-result-context").html("留言成功！（查看请刷新）");
				$("#message-result").css("background-color","#DFF0D8");
				$("#message-result").show();
			}
		})
		.fail(function() {
			console.log("error");
		})
	});
});