const restController = require("../controllers/restController.js")

const adminController = require("../controllers/adminController.js")

const userController = require("../controllers/userController.js")

// module.exports：匯出　Route 設定
// 注意：(app, passport)：接收 app 和 passport
module.exports = (app, passport) => {
  // I. 前台[權限驗證]：authenticated -> 放入 Route
  // authenticated：
  const authenticated = (req, res, next) => {
    // (1) 檢查 User 是否登入，未登入則導回 Sign-in 頁。
    if (req.isAuthenticated()) {
      return next()
    }
    res.redirect("/signin")
  }

  // II.後台[權限驗證]：authenticatedAdmin -> 放入 Route
  // authenticatedAdmin：
  const authenticatedAdmin = (req, res, next) => {
    // (1)驗證 User 登入狀態
    if (req.isAuthenticated()) {
      // (2)檢查 req 內攜帶的 user 實例是否具管理員身份，若無則導回首頁。
      // isAdmin：User Model 新增的身分驗證欄位(Boolean)
      if (req.user.isAdmin) {
        return next()
      }
      return res.redirect("/")
    }
    res.redirect("/signin")
  }

  // 1. 前台：restController ＋ authenticated
  app.get("/", authenticated, (req, res) => {
    res.redirect("/restaurants")
  })

  app.get("/restaurants", authenticated, restController.getRestaurants)

  // 2. 後台：adminController ＋ authenticatedAdmin
  app.get("/admin", authenticatedAdmin, (req, res) => {
    res.redirect("/admin/restaurants")
  })

  app.get("/admin/restaurants", authenticatedAdmin, adminController.getRestaurants)

  // [Create]新增一筆餐廳資料
  app.get("/admin/restaurants/create", authenticatedAdmin, adminController.createRestaurant)

  app.post("/admin/restaurants", authenticatedAdmin, adminController.postRestaurant)

  // [Read/Detail、Show]瀏覽一筆餐廳資料：動態路由:id -> req.params.id
  app.get("/admin/restaurants/:id", authenticatedAdmin, adminController.getRestaurant)

  // [Edit/Update]編輯一筆餐廳資料(1)
  app.get("/admin/restaurants/:id/edit", authenticatedAdmin, adminController.editRestaurant)

  // [Edit/Update]編輯一筆餐廳資料(2)
  app.put("/admin/restaurants/:id", authenticatedAdmin, adminController.putRestaurant)

  // [Delete]刪除一筆餐廳資料
  app.delete("/admin/restaurants/:id", authenticatedAdmin, adminController.deleteRestaurant)

  // 3. Sign-up [User 註冊流程]
  app.get("/signup", userController.signUpPage)

  app.post("/signup", userController.signUp)

  // 4. Sign-in [passport 驗證] & Log-out
  app.get("/signin", userController.signInPage)

  app.post("/signin", passport.authenticate("local",
    { failureRedirect: "/signin", failureflash: true }), userController.signIn)

  app.get("/logout", userController.logout)

}


