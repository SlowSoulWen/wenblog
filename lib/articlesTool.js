exports.articlesTool =  {
	//筛选出给定的文章集合的所有标签
	filterTags : function(data){
		var dataArr = [];
		for(var i = 0; i < data.length; i++){
			var flag = 1;
			for(var j = 0; j < dataArr.length ; j++){
				if(data[i].tag == dataArr[j].tag){
					dataArr[j].num++;
					for(var t = 0;t<data[i].labels.length;t++){
						if( (dataArr[j].labels).indexOf(data[i].labels[t]) == -1 )
							dataArr[j].labels.push(data[i].labels[t]);
					}
					flag = 0;
					break;
				}
			}
			if(flag == 1){
				dataArr.push({
					tag : data[i].tag,
					num : 1,
					labels : data[i].labels
				});
			}
		}
		return dataArr;
	}
}