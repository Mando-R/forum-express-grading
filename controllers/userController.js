// [signup.handlebars] POST -> [userController.js]

const bcrypt = require("bcryptjs")

const db = require("../models")
const User = db.User

//注意：render 檔案、redirect 路由
const userController = {
  // signUpPage：render -> 註冊頁
  signUpPage: (req, res) => {
    return res.render("signup.handlebars")
  },

  // signUp：處理 註冊行為：
  // 收到 [註冊 req]，[註冊 req]內攜帶 表單 Data。
  signUp: (req, res) => {
    // 1. Confirm password
    if (req.body.passwordCheck !== req.body.password) {
      req.flash("error_messages", `兩次密碼輸入不同！`)
      return res.redirect("/signup")
    } else {
      // 2. Confirm unique user
      User.findOne({ where: { email: req.body.email } })
        .then(user => {
          if (user) {
            req.flash("error_messages", "email 重複！")
            return res.redirect("/signup")
          } else {
            // User.create：User Model 建立一個新 User。
            User.create({
              // User 屬性 name 和 email ，設置成客戶端傳來的 Data。
              // 改寫使用結構賦值???
              name: req.body.name,
              email: req.body.email,
              // bcrypt 雜湊 User 密碼，再存入 Database。
              password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null)
            })
              .then(user => {
                req.flash("success_messages", "成功註冊帳號！")
                return res.redirect("/signin")
              })
          }
        })
    }
  },

  // signInPage：render -> 登入頁
  signInPage: (req, res) => {
    return res.render("signin.handlebars")
  },

  // signIn 動作裡看起來沒有任何的邏輯，就直接轉址了，這是因為特下我們會用 Passport 的 middleware 來處理，所以不必自己實作。
  signIn: (req, res) => {
    req.flash("success_messages", `成功登入!`)
    res.redirect("/restaurants")
  },

  logout: (req, res) => {
    req.flash("success_messages", `登出成功!`)
    req.logout()
    res.redirect("/signin")
  }
}

module.exports = userController

