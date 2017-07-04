const fs = require("fs");
const path = require("path");
var ipVisitHistoryData = [];
module.exports = {
    recordIP : function(req,res,next) {
        let ipAddress;
        let headers = req.headers || null;
        let forwardedIpsStr = headers['x-real-ip'] || headers['x-forwarded-for'] || null;
        if(!headers && !forwardedIpsStr) {
            console.log("无法记录访问者ip");
            next();
        }
        forwardedIpsStr ? ipAddress = forwardedIpsStr : ipAddress = null;
        if (!ipAddress) {
            ipAddress = req.connection.remoteAddress;
        }
        ipVisitHistoryData.push("访问IP：" + ipAddress + "   |  访问时间：" + (new Date()).toLocaleDateString() + " " +  (new Date()).toLocaleTimeString() + "\r"); 
        if(ipVisitHistoryData.length >= 10) {
            fs.appendFile(path.join(__dirname,'../ipVisitHistory.txt'), ipVisitHistoryData ,'utf8', (err) => {
                if (err) throw err;
                console.log('访问者IP已记录在根目录的ipVisitHistory.txt文件中。');
                ipVisitHistoryData = [];
            });
        }
        next();
    }
}