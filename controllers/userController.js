// [signup.handlebars] POST -> [userController.js]
const bcrypt = require("bcryptjs")

const db = require("../models")
const favorite = require("../models/favorite")
const User = db.User
const Restaurant = db.Restaurant
const Comment = db.Comment
const Favorite = db.Favorite
const Followship = db.Followship

// 引入 imgur 套件：整合第三方 Imgur API
const imgur = require("imgur-node-api")
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID  // Client ID -> .env(隱藏敏感資訊)

// 引入 multer 套件的 fs 模組：上傳 image
const fs = require("fs")
const { userInfo } = require("os")

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
        // 整理 users 資料
        users = users.map(user => ({
          ...user.dataValues,
          // user物件{}內，新增 FollowerCount ，計算追蹤者人數。
          FollowerCount: user.Followers.length,
          // 判斷目前登入使用者是否已追蹤該 User 物件
          isFollowed: req.user.Followings.map(following => following.id).includes(user.dataValues.id)
          // includes(user.id) 可不加 .dataValues
        }))

        // console.log("req.user.Followings", req.user.Followings)
        // console.log("------------------")
        // console.log("req.user.Followings[0]=following", req.user.Followings[0])
        // console.log("------------------")
        // console.log("req.user.Followings[0]=following.id", req.user.Followings[0].id)

        // 依追蹤者人數排序清單
        // 最後有一行 users = users.sort((a, b) => b.FollowerCount - a.FollowerCount)，我們這裡先跳過，把功能做好以後，這個單元後面會補充。
        // .sort()：把陣列按照「字典順序」排序
        // 根據 FollowerCount 把 user 由大排到小，追蹤者多的人排在前面。
        users = users.sort((a, b) => b.FollowerCount - a.FollowerCount)

        return res.render("topUser.handlebars", { users: users })

      })
  },

  // 追蹤功能：注意 req.user.id vs. req.params.userId
  addFollowing: (req, res) => {
    return Followship.create({
      followerId: req.user.id,
      followingId: req.params.userId
    })
      .then(followship => {
        // console.log("req.user.id", req.user.id)
        // console.log("req.params.userId", req.params.userId)

        return res.redirect("/users/top")
        // return res.redirect("back")

      })
  },

  removeFollowing: (req, res) => {
    return Followship.findOne({
      where: {
        followerId: req.user.id,
        followingId: req.params.userId
      }
    })
      .then(followship => {
        followship.destroy()
          .then(followship => {
            return res.redirect("/users/top")
            // return res.redirect("back")
          })
      })
  },

  // Profile
  // [GET]瀏覽 Profile
  getUser: (req, res) => {
    User.findByPk(req.params.id, {
      include: [
        { model: Comment, include: [{ model: Restaurant }] },
      ]
    })
      .then(user => {
        // 注意：Array.toJSON()：即可展開內層 dataValues，不須 map + ...。
        // console.log("user", user)
        // console.log("user.toJSON()", user.toJSON())
        // console.log("user.toJSON().Comments", user.toJSON().Comments)

        // 1. 已分享的評論
        // const profile = user.toJSON()
        const comments = user.toJSON().Comments
        const commentsAmount = comments.length
        // console.log("comments", comments)
        // console.log("commentsAmount", commentsAmount)

        // 2. 已評論過的 Restaurant 數量：
        // (1) 陣列 arrayRestaurantId = 陣列 comments -> .map() 取出每筆 RestaurantId -> .filter() 篩選出不重複值，並 return 一陣列。
        const arrayRestaurantId =
          comments.map((item, index) => {
            return item.RestaurantId
          }).filter((item, index, array) => {
            // indexOf(item)：回傳數字順序(從0開始)
            return array.indexOf(item) === index
          })
        // (2) length()：計算數量
        const commentsRestaurantAmount = arrayRestaurantId.length
        // console.log(commentRestaurantAmount)

        return res.render("profile.handlebars", {
          user: user.toJSON(),
          comments: comments,
          commentsAmount: commentsAmount,
          commentsRestaurantAmount: commentsRestaurantAmount,
        })
      })
  },
  // [GET]瀏覽編輯 Profile 頁面
  editUser: (req, res) => {
    User.findByPk(req.params.id)
      .then(user => {
        // console.log("req.params.id", req.params.id)
        // console.log("user", user)
        return res.render("profileEdit.handlebars",
          { user: user.toJSON() }
        )
      })
  },

  // [PUT]編輯 Profile：修改自 adminController.putRestaurant
  putUser: (req, res) => {
    if (!req.body.name) {
      req.flash("error_messages", `Name is required!`)
      return res.redirect("back")
    }
    // destructuring(解構賦值)：const file = req.file
    const { file } = req
    // 1. 若有圖片：
    if (file) {
      // 2. 呼叫 imgur  API
      imgur.setClientID(IMGUR_CLIENT_ID);

      // 3. 圖片直接從暫存資料夾上傳上去，
      // .upload(file.path,...)：上傳至 file.path(指令位置)。
      // img：上傳完的圖片。
      imgur.upload(file.path, (err, img) => {
        // 4. 把這個網址放到資料庫裡。
        // profileEdit.handlebars 的 href="/users/{{user.id}}" -> 用 User.findByPk(req.params.id) 抓 user.id
        return User.findByPk(req.params.id)
          .then(user => {
            user.update({
              name: req.body.name,
              // img.fata.link：取得上傳圖片後的 URL。上傳成功後 http://img.data.link/ 會是剛剛上傳後拿到的圖片網址。
              image: file ? img.data.link : user.image
            })
              .then(user => {
                req.flash('success_messages', `User name " ${req.body.name} " was successfully updated!`)

                return res.redirect(`/users/${user.id}`)
              })
          })
      })
    }
    else {
      return User.findByPk(req.params.id)
        .then(user => {
          // user.update：Update 資料
          user.update({
            name: req.body.name,
            image: file ? img.data.link : user.image
          })
            .then(user => {
              req.flash('success_messages', `User name " ${req.body.name} " was successfully updated!`)

              res.redirect(`/users/${user.id}`)
            })
        })
    }
  }
}


module.exports = userController

