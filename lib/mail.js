/**
 * 发邮件 工具类
 * 2018/5/23
**/
const { emailName, emailPassword } = require("../config/mailConfig")
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    service: 'qq',
    secure: true,
	port: 465, // SMTP 端口
    secureConnection: false, // 使用 SSL
	auth: {
		user: emailName,
		pass: emailPassword
    },
    tls:{
        rejectUnauthorized: false
    }
})

/**
 * 发邮件 普通 html
 * @param {String} toEmail 接收方邮箱地址
 * @param {Object} title 标题
 * @param {Object} text 内容
 */
function sendMailForHtml(toEmail, title, text) {
	let mailOptions = {
		from: emailName,    // 发件地址
		to: toEmail,        // 收件列表
		subject: title,     // 标题
		html: '<meta http-equiv="Content-Type" content="text/html; charset=utf-8">' + text  // html 内容
	};
	transporter.sendMail(mailOptions, function(error, info) {
		if(error) {
			return console.log(error);
		}
		console.log('Message sent: ' + info.response);
	});
}

module.exports = {
	mailSend: sendMailForHtml
}
