const express = require("express")
const handlebars = require("express-handlebars")
const app = express()
const port = 3000


// Handlebars
app.engine("handlebars", handlebars({ defaultLayout: "main.handlebars" }))

app.set("view engine", "handlebars")

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`)
})

// 1. routes/index.js 用 module.exports 匯出 Route 設定，接著到 app.js 透過 require 引入 function。

// 2. routes/index.js 的 app.get，這個 app 是外面傳進來的參數，要在app.js 內把 express() 傳給 Route。

// 3. 最後合併，變成 express.get(...)，即「Express 拿到這個畫面...」。

// 4. 注意：require('./routes')(app) 需放在 app.js 最後一行，因按照由上而下順序，當 app.js 把 app(即 express()) 傳入 Route 時，程式中間(routes/index.js)做的 Handlebars 設定、Server 設定，也一併透過 app 變數傳入。

// 引入 routes 並將 app 傳進去，讓 routes 可以用 app 這個物件來指定路由
require("./routes")(app)

module.exports = app
