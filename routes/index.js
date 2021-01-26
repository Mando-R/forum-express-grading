const restController = require("../controllers/restController.js")

const adminController = require("../controllers/adminController.js")

const userController = require("../controllers/userController.js")

// module.exports：匯出　Route 設定
module.exports = app => {

  // 1. 前台 restController
  app.get("/", (req, res) => res.redirect("/restaurants"))

  // 在 /restaurants 底下則交給 restController.getRestaurants 處理。
  app.get("/restaurants", restController.getRestaurants)

  // 2. 後台 adminController
  app.get("/admin", (req, res) => {
    res.redirect("/admin/restaurants")
  })

  app.get("/admin/restaurants", adminController.getRestaurants)

  // 3. User 註冊流程
  app.get("/signup", userController.signUpPage)

  app.post("/signup", userController.signUp)



}


