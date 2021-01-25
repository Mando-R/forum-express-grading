const restController = require("../controllers/restController.js")

const adminController = require("../controllers/adminController.js")

// module.exports：匯出　Route 設定
module.exports = app => {

  // 前台：restController
  app.get("/", (req, res) => res.redirect("/restaurants"))

  // 在 /restaurants 底下則交給 restController.getRestaurants 處理。
  app.get("/restaurants", restController.getRestaurants)

  // 後台：adminController
  app.get("/admin", (req, res) => {
    res.redirect("/admin/restaurants")
  })

  app.get("/admin/restaurants", adminController.getRestaurants)

}


