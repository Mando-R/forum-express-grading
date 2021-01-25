'use strict'

const fs = require('fs')
const path = require('path')
const Sequelize = require('sequelize')
const basename = path.basename(__filename)
const env = process.env.NODE_ENV || 'development'
const config = require(__dirname + '/../config/config.json')[env]
const db = {}

// 1. 資料庫連線
// 目的：連線資料庫，呼叫 config.json 的設定檔。

// 但若 config.json 內有一個 use_env_variable，就會優先根據環境變數決定連線資料庫的參數，而非之前在 config.json 寫的設定。

// 因程式碼會發佈出去，雖然有放一個 production 群組，但不可能真的把正式站的資料庫 root 密碼放到程式碼裡。

// 之後 Heroku 佈署時，就會去 Heroku 後台運用環境變數設定資料庫。
let sequelize
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config)
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config)
}

// 2. 動態引入其他 models
// 利用 Node.js 內建的檔案管理模組 fs(file system)，尋找在 models 目錄底下以.js 結尾的檔案。找到檔案以後，運用 sequelize 將其引入。

// 例如：假設有個 model 檔案 User.js，被 fs 掃瞄且引入進來，之後就可以用 db.User 存取此 Model。
fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js')
  })
  .forEach(file => {
    const model = sequelize['import'](path.join(__dirname, file))
    db[model.name] = model
  })

// 3. 設定 Models 之間的關聯：1 -> M、M -> M。
// 設定每個 model 之間關聯，即一對多或多對多關係，之後用 sequelize 語法設定 model 之間關聯，而此段落是在掃描關聯設定，且把這些 model 設定在資料庫端建立起來。
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db)
  }
})

// 4. 匯出需要的物件
// 把跟 sequelize 有關的物件 export 出去，讓其他模組可使用。

// 大小寫的區分：
// (1) db.sequelize[小寫]：代表連線資料庫的 instance(實例)。
db.sequelize = sequelize
// (2) db.Sequelize[大寫]：存取到 Sequelize 這個 class ，代表 Sequelize 函式庫本身。
db.Sequelize = Sequelize

module.exports = db
