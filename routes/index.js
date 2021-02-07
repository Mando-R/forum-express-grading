const helpers = require("../_helpers")

const restController = require("../controllers/restController.js")

const adminController = require("../controllers/adminController.js")

const userController = require("../controllers/userController.js")

const categoryController = require("../controllers/categoryController.js")

// multer 套件(image)：上傳[temp 資料夾] vs. 使用[upload 資料夾]
// (1) 分開 上傳[temp 資料夾] vs. 使用[upload 資料夾] 邏輯，成功上傳 -> 才使用。
// (2) 上傳到 temp 過程可能錯誤，所以「上傳失敗」暫存檔留在 temp 資料夾內，需定時清空，但 upload 資料夾內必是對外使用的檔案。
// (3) 可順便自定義檔名(基礎的 multer 沒有自定義檔名的功能)
const multer = require("multer")
const upload = multer({ dest: "temp/" })

// module.exports：匯出　Route 設定
// 注意：(app, passport)：接收 app 和 passport
module.exports = (app, passport) => {
  // I. 前台[權限驗證]：authenticated -> 放入 Route
  // authenticated：
  const authenticated = (req, res, next) => {
    // (1) 檢查 User 是否登入，未登入則導回 Sign-in 頁。
    // if (req.isAuthenticated()) {
    if (helpers.ensureAuthenticated(req)) {
      return next()
    }
    res.redirect("/signin")
  }

  // II.後台[權限驗證]：authenticatedAdmin -> 放入 Route
  // authenticatedAdmin：
  const authenticatedAdmin = (req, res, next) => {
    // (1)驗證 User 登入狀態
    // if (req.isAuthenticated()) {
    if (helpers.ensureAuthenticated(req)) {
      // (2)檢查 req 內攜帶的 user 實例是否具管理員身份，若無則導回首頁。
      // isAdmin：User Model 新增的身分驗證欄位(Boolean)
      // if (req.user.isAdmin) {
      if (helpers.getUser(req).isAdmin) {
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
  // upload.single("image")：multer 只要碰到 req 內有圖片檔，就自動複製檔案至 temp 資料夾內。
  app.get("/admin/restaurants/create", authenticatedAdmin, adminController.createRestaurant)

  app.post("/admin/restaurants", authenticatedAdmin, upload.single("image"), adminController.postRestaurant)

  // [Read/Detail、Show]瀏覽一筆餐廳資料：動態路由:id -> req.params.id
  app.get("/admin/restaurants/:id", authenticatedAdmin, adminController.getRestaurant)

  // [Edit/Update]編輯一筆餐廳資料(1)
  app.get("/admin/restaurants/:id/edit", authenticatedAdmin, adminController.editRestaurant)

  // [Edit/Update]編輯一筆餐廳資料(2)
  // upload.single("image")：multer 只要碰到 req 內有圖片檔，就自動複製檔案至 temp 資料夾內。
  app.put("/admin/restaurants/:id", authenticatedAdmin, upload.single("image"), adminController.putRestaurant)

  // [Delete]刪除一筆餐廳資料
  app.delete("/admin/restaurants/:id", authenticatedAdmin, adminController.deleteRestaurant)

  // Authority 設定：set as user/admin
  app.get("/admin/users", authenticatedAdmin, adminController.getUser)

  app.put("/admin/users/:id/toggleAdmin", authenticatedAdmin, adminController.putUser)

  // Category
  // (1)[Read] Category
  app.get("/admin/categories", authenticatedAdmin, categoryController.getCategories)

  // (2)[Create] Category
  app.post("/admin/categories", authenticatedAdmin, categoryController.postCategory)

  // (3)[Update] Category
  app.get("/admin/categories/:id", authenticatedAdmin, categoryController.getCategories)

  app.put("/admin/categories/:id", authenticatedAdmin, categoryController.putCategory)

  // (4)[Delete] Category
  app.delete("/admin/categories/:id", authenticatedAdmin, categoryController.deleteCategory)





  // 3. Sign-up [User 註冊流程]
  app.get("/signup", userController.signUpPage)

  app.post("/signup", userController.signUp)

  // 4. Sign-in [passport 驗證] & Log-out
  app.get("/signin", userController.signInPage)

  app.post("/signin", passport.authenticate("local",
    { failureRedirect: "/signin", failureflash: true }), userController.signIn)

  app.get("/logout", userController.logout)

}


