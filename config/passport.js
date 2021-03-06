// 引入 .env
require('dotenv').config()

// 注意：req.user 取得 Passport 套件 包裝後的資料。
const passport = require("passport")
const LocalStrategy = require("passport-local")
const bcrypt = require("bcryptjs")
const db = require("../models")
const User = db.User
const Restaurant = db.Restaurant

passport.use(new LocalStrategy(
  // 設定客製化選項：Customize user field
  {
    usernameField: "email",
    passwordField: "password",
    // passReqToCallback: true：
    // 對應下方 Authenticate user，可以 callback 第一個參數內取得 req，就可呼叫 req.flash() 放入客製化訊息。
    passReqToCallback: true
  },

  // 登入驗證程序：Authenticate user
  // cb：指 callback，對應官方文件的 done。寫成 cb，加強表達 callback 的意思，即驗證後執行的另一個 callback function。
  (req, username, password, cb) => {
    User.findOne({ where: { email: username } })
      .then(user => {
        // 若在前面兩關 if() {return } 被擋下，就回傳 cb(null, false, ...)，只要在第二位帶入 false 代表登入失敗。
        // (1) 驗證失敗：找不到 user
        if (!user) {
          return cb(null, false, req.flash("error_messages", `帳號或密碼輸入錯誤`))
        }
        // (2) 驗證失敗：找到 user ，但 "Database 密碼"和"表單密碼"不一致。
        if (!bcrypt.compareSync(password, user.password)) {
          return cb(null, false, req.flash("error_messages", `帳號或密碼輸入錯誤！`))
        }
        // (3) 驗證成功：找到 user ，且"Database 密碼"和"表單密碼"一致。
        // 在 User.findOne().then() 段落，要成功走到最後一行，才會 return cb(null, user)，第一個 null 是 Passport 奇妙設計，不要管他，第二個參數如果傳到 user，代表成功登入，並且會回傳 user。
        return cb(null, user)

      })
  }
))

// Serialize & Deserialize：轉換資料過程，主要目的為節省空間。
// 1. Serialize user：只存 user id，不存整個 user。
passport.serializeUser((user, cb) => {
  // 
  cb(null, user.id)
})

// Deserialize user：透過 user id，取出整個 user 物件實例。
passport.deserializeUser((id, cb) => {
  // 注意：從 User Model(Database) 取出 user Data。
  User.findByPk(id, {
    // 注意：passport.js 設定 passport.deserializeUser[Eager Loading] -> req.user：isFavorited、isLiked
    include: [
      // as：標明引入的資料關係，之後使用 "req.user"，一併取得收藏restaurant 的資料！
      // isFavorited
      { model: Restaurant, as: "FavoritedRestaurants" },
      // isLiked
      { model: Restaurant, as: "LikedRestaurants" },
      { model: User, as: "Followers" },
      { model: User, as: "Followings" }
    ]
  })
    .then(user => {
      user = user.toJSON()
      return cb(null, user)
    })
})

// 登入後，passport 預設把整個 user 物件實例存在 session 內，佔用許多 session 空間，且很多資訊可能也用不到。

// 但其實因 user id 是獨一無二，只要有 user id，就能另查找出 user 物件。所以：

// 1. Serialize：只存 user id，不存整個 user。
// 2. Deserialize：透過 user id，取出整個 user 物件實例。

// 當資料很大包、會頻繁使用資料，但用到的欄位又很少時，就會考慮使用序列化技巧節省空間。

// 這裡 Passport 已準備好序列化和反序列化的實作，把這段程式碼加到 Passport 設定檔裡，以後就可呼叫這兩個方法。

// JWT(JSON Web Token) 登入機制：對比上方 Deserialize user
const jwt = require("jsonwebtoken")
const passportJWT = require("passport-jwt")
const ExtractJwt = passportJWT.ExtractJwt
const JwtStrategy = passportJWT.Strategy

// 設定 變數物件{} = jwtOptions
let jwtOptions = {}

// jwtOptions.jwtFromRequest：設定何處找 token，指定 authorization header 的 bearer 項目。
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()

// jwtOptions.secretOrKey：使用密鑰檢查 token 是否經過纂改，密鑰 = 放進 process.env.JWT_SECRET 的 "alphacamp" 字串，這組密鑰只有 Server 知道。
jwtOptions.secretOrKey = process.env.JWT_SECRET

let strategy = new JwtStrategy(jwtOptions, function (jwt_payload, next) {

  // 根據 jwtOptions 裡的資訊，理論上可成功解開 token，接著運用裡面的資訊查找 user。

  // 剛才做 / signin 時已把 user id 放入 payload，所以此處解開 token 後，可運用 jwt_payload.id 去 User table 裡找出使用者。
  User.findByPk(jwt_payload.id, {
    include: [
      { model: db.Restaurant, as: "FavoritedRestaurants" },
      { model: db.Restaurant, as: "LikedRestaurants" },
      { model: User, as: "Followers" },
      { model: User, as: "Followings" }
    ]
  })
    // 找到 user 後將其回傳，即可繼續在專案裡使用 req.user 得到登入 user。
    .then(user => {
      if (!user) {
        return next(null, false)
      }

      return next(null, user)
    })
})

passport.use(strategy)


module.exports = passport


