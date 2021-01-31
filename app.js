const express = require("express")
const handlebars = require("express-handlebars")
const db = require("./models")
const bodyParser = require("body-parser")
const methodOverride = require("method-override")
const helpers = require("./_helpers")

const app = express()
const port = process.env.PORT || 3000
// 若現在環境 非 "production"，則使用 dotenv 資訊。在文件上方加入，現在沒什麼影響，但之後設定變多以後會有順序問題，記得要加在 Passport 之前。
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config()
}
const passport = require("./config/passport.js")
const session = require("express-session")
const flash = require("connect-flash")

// Handlebars
app.engine("handlebars", handlebars({ defaultLayout: "main.handlebars" }))
app.set("view engine", "handlebars")

// app.use
// (1) bodyParser
app.use(bodyParser.urlencoded({ extended: true }))

// (2) express-session
app.use(session({ secret: "secret", resave: false, saveUninitialized: false }))

// (4) passport
// 初始化 Passport
app.use(passport.initialize())
// 啟動 session 功能，這組設定務必要放在 session() 之後
app.use(passport.session())

// (5) method-override
app.use(methodOverride("_method"))

// (3) connect-flash：注意 放在 passport 後面，res.locals.user 才能傳給 Views。
app.use(flash())
// [app.js] res.locals -> [Controllers] req.flash -> [Views] Handlebars
app.use((req, res, next) => {
  // req.flash 放入 res.locals 內
  // res.locals [view 專屬]：把變數放入 res.locals 內，讓所有 view 都能存取。
  res.locals.success_messages = req.flash("success_messages")
  res.locals.error_messages = req.flash("error_messages")

  // res.locals.user = req.user
  res.locals.user = helpers.getUser(req)  // 取代 req.user

  next()
})

// (6) multeer(image)：設定靜態檔案路徑 /upload
// 加上 Route："/upload"，因為是靜態檔案，所以不需像其他 Route 路由一樣寫 Controller 邏輯，直接用 express.static 指定路徑即可。
app.use("/upload", express.static(__dirname + "/upload"))




app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`)
})

// 1. routes/index.js 用 module.exports 匯出 Route 設定，接著到 app.js 透過 require 引入 function。

// 2. routes/index.js 的 app.get，這個 app 是外面傳進來的參數，要在app.js 內把 express() 傳給 Route。

// 3. 最後合併，變成 express.get(...)，即「Express 拿到這個畫面...」。

// 4. 注意：require('./routes')(app) 需放在 app.js 最後一行，因按照由上而下順序，當 app.js 把 app(即 express()) 傳入 Route 時，程式中間(routes/index.js)做的 Handlebars 設定、Server 設定，也一併透過 app 變數傳入。

// 引入 routes 並將 app 傳進去，讓 routes 可以用 app 這個物件來指定路由
require("./routes")(app, passport) // 把 passport 傳入 routes

module.exports = app
