"use strict";
const path = require('path');
const express = require('express');
const session = require('express-session');
const config = require('config-lite');
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const fs = require("fs");
const routes = require('./routes');
const app = express();

app.set('port',process.env.PORT || 8080);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
let hbs = handlebars.create({
    partialsDir: 'views/partials/',
    layoutsDir: "views/layouts/",
    defaultLayout: 'main',
    extname: '.hbs',
    helpers : {
      section: function(name,options){
        if(!this._sections) 
          this._sections = {};
          this._sections[name] = options.fn(this);
          return null;
      }
    }
});
app.engine('hbs', hbs.engine);
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
// session 中间件
app.use(session({
  name: config.session.key,// 设置 cookie 中保存 session id 的字段名称
  secret: config.session.secret,// 通过设置 secret 来计算 hash 值并放在 cookie 中，使产生的 signedCookie 防篡改
  cookie: {
    maxAge: config.session.maxAge// 过期时间，过期后 cookie 中的 session id 自动删除
  }
  // store: new MongoStore({// 将 session 存储到 mongodb
  //   url: config.mongodb// mongodb 地址
  // })
}));
// 路由
routes(app);

app.listen(config.port,"0.0.0.0");
