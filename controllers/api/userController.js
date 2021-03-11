const bcrypt = require('bcryptjs')
const db = require('../../models')
const { User } = db

// JWT
const jwt = require('jsonwebtoken')
const passportJWT = require('passport-jwt')
const ExtractJwt = passportJWT.ExtractJwt
const JwtStrategy = passportJWT.Strategy

const userController = {
  signIn: (req, res) => {
    // 檢查必要資料：email & password
    if (!req.body.email || !req.body.password) {
      return res.json({
        status: 'error',
        message: "required fields didn't exist"
      })
    }
    // 檢查 user 是否存在與密碼是否正確
    let username = req.body.email
    let password = req.body.password

    User.findOne({ where: { email: username } })
      // 登入程序一：
      // 1. 檢查帳號密碼，先確認 email 能否對應系統內 user，若無，則回傳 HTTP 狀態碼 401，代表權限不足。
      .then(user => {
        if (!user) {
          return res.status(401).json({
            status: 'error',
            message: 'no such user found'
          })
        }
        // 2. 若 email 有對應系統內 user，再檢查密碼是否正確。
        if (!bcrypt.compareSync(password, user.password)) {
          return res.status(401).json({
            status: 'error',
            message: 'passwords did not match'
          })
        }

        // 登入程序二(簽發 token)：若帳號&密碼都通過檢查，就準備簽發 token。

        // jwt.sign()：將資料變成 JSON web token，必要參數兩個：
        // 1. payload：想打包的資訊，放入{ id: user.id }，稍後在 Passport 設定檔裡，解開 token 後才能用 id 找到 User。
        // 2. 密鑰：JWT 用密鑰 + header + payload 進行雜湊Hash，產生一組不可反解亂數，若 payload 和 header 被纂改，就無法相符這組亂數。
        // 註：密鑰設定成 'alphacamp'，之後在 commit 前會把這個字串放進 .env 檔案。
        let payload = { id: user.id }
        let token = jwt.sign(payload, process.env.JWT_SECRET)

        return res.json({
          status: 'success',
          message: 'ok',
          // 完成 JWT 後[let token = jwt.sign(...)]，將 JWT 放入 res.json 內，回傳給 Client 端。
          token: token,
          user: {
            id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin
          }
        })
      })
  }
}


module.exports = userController

