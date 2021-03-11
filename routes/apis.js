const express = require("express")
const router = express.Router()
const passport = require("../config/passport")

// token 登入機制
const userController = require("../controllers/api/userController.js")

const adminController = require("../controllers/api/adminController.js")

// passport.authenticate()：是 passport-jwt 提供的函數方法，仿照官方文件作法設定，但將此函數封裝成 authenticated，作為 middleware 加入 route。
const authenticated = passport.authenticate("jwt", { session: false })

const authenticatedAdmin = (req, res, next) => {
  if (req.user) {
    if (req.user.isAdmin) {
      return next()
    }
    return res.json({
      status: "error",
      message: "permission denied"
    })

  } else {
    return res.json({
      status: "error",
      message: "permission denied"
    })
  }
}

// Router
// 將 authenticated、authenticatedAdmin 作為 middleware，放入每條 Router。

router.get("/admin/restaurants", authenticated, authenticatedAdmin, adminController.getRestaurants)

router.delete("/admin/restaurants/:id", authenticated, authenticatedAdmin, adminController.deleteRestaurant)

// JWT(JASON Web Token) 登入機制
router.post("/signin", userController.signIn)


module.exports = router
