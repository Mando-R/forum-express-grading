// [signup.handlebars] POST -> [userController.js]

const bcrypt = require("bcryptjs")

const db = require("../models")
const User = db.User

const userController = {
  // signUpPage：render -> 註冊頁
  signUpPage: (req, res) => {
    return res.render("signup.handlebars")
  },

  // signUp：處理 註冊行為：
  // (1) 收到 [註冊 req]，[註冊 req]內攜帶 表單 Data。
  signUp: (req, res) => {
    // 要先安裝 body-parser：處理 POST。
    console.log(req.body)

    // (2) User.create：User Model 建立一個新 User。
    User.create({

      // (3) User 屬性 name 和 email ，設置成客戶端傳來的 Data。
      // 改寫使用結構賦值???
      name: req.body.name,
      email: req.body.email,

      // (4) bcrypt 雜湊 User 密碼，再存入 Database。
      password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null)
    })

      .then(user => {
        return res.redirect("/signin")
      })
  }
}

module.exports = userController

