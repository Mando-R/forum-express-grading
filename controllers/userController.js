// [signup.handlebars] POST -> [userController.js]
const bcrypt = require("bcryptjs")

const db = require("../models")
const favorite = require("../models/favorite")
const User = db.User
const Restaurant = db.Restaurant
const Comment = db.Comment
const Favorite = db.Favorite

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
  },

  // 加入最愛 功能
  addFavorite: (req, res) => {
    return Favorite.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId
    })
      .then(restaurant => {
        return res.redirect("back")
      })
  },
  // 移除最愛 功能
  removeFavorite: (req, res) => {
    return Favorite.findOne({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      }
    })
      .then(favorite => {
        favorite.destroy()
          .then(restaurant => {
            return res.redirect("back")
          })
      })
  },

  // 美食達人頁面
  // 總之這裡就是指定這個 users 陣列要用 FollowerCount 來排序。因為這是一個「達人排行榜」，所以追蹤者人數 (FollowerCount) 最多的需要排在最前面。而 FollowerCount 並不是 Sequelize 物件的一部分，所以要在 users 陣列清單整理好了以後，再用陣列方法 sort 來排序。
  getTopUser: (req, res) => {
    // 撈出所有 User 與 followers 資料
    return User.findAll({
      include: [
        { model: User, as: "Followers" }
      ]
    })
      .then(users => {
        console.log("users", users)

        // 整理 users 資料
        users = users.map(user => ({
          ...user.dataValues,
          // user物件{}內，新增 FollowerCount ，計算追蹤者人數。
          FollowerCount: user.Followers.length,
          // 判斷目前登入使用者是否已追蹤該 User 物件
          isFollowed: req.user.Followings.map(d => d.id).includes(user.id)
        }))

        console.log("users", users)
        // 依追蹤者人數排序清單
        // 最後有一行 users = users.sort((a, b) => b.FollowerCount - a.FollowerCount)，我們這裡先跳過，把功能做好以後，這個單元後面會補充。
        // .sort()：把陣列按照「字典順序」排序
        // 根據 FollowerCount 把 user 由大排到小，追蹤者多的人排在前面。
        users = users.sort((a, b) => b.FollowerCount - a.FollowerCount)

        return res.render("topUser.handlebars", { users: users })

      })
  }
}


module.exports = userController

