// routes/index.js：成為分流入口

// 分流至 routes/routes.js
const routes = require("./routes")

// 分流至 routes/apis.js
const apis = require("./apis")

module.exports = (app) => {
  app.use("/", routes)
  app.use("/api", apis)
}

