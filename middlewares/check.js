module.exports = {
  checkLogin: function checkLogin(req, res, next) {
    if (!req.session.admin) {
      console.log("未登录!");
        req.session.flash = {
          type : 'danger',
          intro : "验证过期",
          message : "请先登录!"
        }      
      return res.redirect(303,'http://123.207.59.80/manage/signin');
    }
    next();
  },

  checkNotLogin: function checkNotLogin(req, res, next) {
    if (req.session.admin) {
       console.log("已登录!");
        req.session.flash = {
          type : 'danger',
          intro : "温馨提示",
          message : "您已经登陆过了!"
        }
      return res.redirect(303,'http://123.207.59.80/manage');//返回之前的页面
    }
    next();
  }
};
