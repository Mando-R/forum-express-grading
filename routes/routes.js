const express = require("express")
// 引入分流套件 Router()
const router = express.Router()
// 引入 Passport 套件
const passport = require("../config/passport")
const helpers = require("../_helpers")

const restController = require("../controllers/restController.js")
const adminController = require("../controllers/adminController.js")
const userController = require("../controllers/userController.js")
const categoryController = require("../controllers/categoryController.js")
const commentController = require("../controllers/commentController.js")

// multer 套件(image)：上傳[temp 資料夾] vs. 使用[upload 資料夾]
// (1) 分開 上傳[temp 資料夾] vs. 使用[upload 資料夾] 邏輯，成功上傳 -> 才使用。
// (2) 上傳到 temp 過程可能錯誤，所以「上傳失敗」暫存檔留在 temp 資料夾內，需定時清空，但 upload 資料夾內必是對外使用的檔案。
// (3) 可順便自定義檔名(基礎的 multer 沒有自定義檔名的功能)
const multer = require("multer")
const upload = multer({ dest: "temp/" })

// module.exports：匯出　Route 設定
// 注意：(router, passport)：接收 router 和 passport
// module.exports = (router, passport) => {
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
router.get("/", authenticated, (req, res) => {
  res.redirect("/restaurants")
})
// [Read]瀏覽 全部 餐廳
router.get("/restaurants", authenticated, restController.getRestaurants)

// Ordering(Feeds)：注意排序在 "/restaurants/:id" 前面。
// 注意："/restaurants/feeds" 也符合動態路由 "/restaurants/:id" 結構，被視為「:id 是 feeds」而導向[Read]單一餐廳頁面。
router.get("/restaurants/feeds", authenticated, restController.getFeeds)

// [Read]瀏覽 單一 餐廳
router.get("/restaurants/:id", authenticated, restController.getRestaurant)

// Dashboard
router.get('/restaurants/:id/dashboard', authenticated, restController.getDashboard)

// 美食達人
// 注意：這組路由要放在 GET /users/:id 的前面，不然 /users/top 會被優先用 /users/:id 的結構來解析
router.get("/users/top", authenticated, userController.getTopUser)

router.post("/following/:userId", authenticated, userController.addFollowing)

router.delete("/following/:userId", authenticated, userController.removeFollowing)

// [Create/POST]新增評論
router.post("/comments", authenticated, commentController.postComment)

// [Delete]刪除一筆評論(Comment)：限制 Admin 權限
router.delete("/comments/:id", authenticatedAdmin, commentController.deleteComment)

// 加到 最愛
router.post("/favorite/:restaurantId", authenticated, userController.addFavorite)
// 移除 最愛
router.delete("/favorite/:restaurantId", authenticated, userController.removeFavorite)

// User Profile：不受限 admin。
router.get("/users/:id", authenticated, userController.getUser)

router.get("/users/:id/edit", authenticated, userController.editUser)
// muler 套件：req 偵測到圖片上傳 upload.single("image")，就會 image 寫入資料夾"temp/"內[const upload = multer({ dest: "temp/" }) ]
router.put("/users/:id", authenticated, upload.single("image"), userController.putUser)


// 2. 後台：adminController ＋ authenticatedAdmin
router.get("/admin", authenticatedAdmin, (req, res) => {
  res.redirect("/admin/restaurants")
})

router.get("/admin/restaurants", authenticatedAdmin, adminController.getRestaurants)

// [Create]新增一筆餐廳資料
// upload.single("image")：multer 只要碰到 req 內有圖片檔，就自動複製檔案至 temp 資料夾內。
router.get("/admin/restaurants/create", authenticatedAdmin, adminController.createRestaurant)

router.post("/admin/restaurants", authenticatedAdmin, upload.single("image"), adminController.postRestaurant)

// [Read/Detail、Show]瀏覽一筆餐廳資料：動態路由:id -> req.params.id
router.get("/admin/restaurants/:id", authenticatedAdmin, adminController.getRestaurant)

// [Edit/Update]編輯一筆餐廳資料(1)
router.get("/admin/restaurants/:id/edit", authenticatedAdmin, adminController.editRestaurant)

// [Edit/Update]編輯一筆餐廳資料(2)
// upload.single("image")：multer 只要碰到 req 內有圖片檔，就自動複製檔案至 temp 資料夾內。
router.put("/admin/restaurants/:id", authenticatedAdmin, upload.single("image"), adminController.putRestaurant)

// [Delete]刪除一筆餐廳資料
router.delete("/admin/restaurants/:id", authenticatedAdmin, adminController.deleteRestaurant)



// Authority 設定：set as user/admin
router.get("/admin/users", authenticatedAdmin, adminController.getUser)

router.put("/admin/users/:id/toggleAdmin", authenticatedAdmin, adminController.putUser)

// Category
// (1)[Read] Category
router.get("/admin/categories", authenticatedAdmin, categoryController.getCategories)

// (2)[Create] Category
router.post("/admin/categories", authenticatedAdmin, categoryController.postCategory)

// (3)[Update] Category
router.get("/admin/categories/:id", authenticatedAdmin, categoryController.getCategories)

router.put("/admin/categories/:id", authenticatedAdmin, categoryController.putCategory)

// (4)[Delete] Category
router.delete("/admin/categories/:id", authenticatedAdmin, categoryController.deleteCategory)



// 3. Sign-up [User 註冊流程]
router.get("/signup", userController.signUpPage)

router.post("/signup", userController.signUp)

// 4. Sign-in [passport 驗證] & Log-out
router.get("/signin", userController.signInPage)

router.post("/signin", passport.authenticate("local",
  { failureRedirect: "/signin", failureflash: true }), userController.signIn)

router.get("/logout", userController.logout)


module.exports = router

