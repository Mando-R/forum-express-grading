// 引入 imgur 套件：整合第三方 Imgur API
const imgur = require("imgur-node-api")
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID  // Client ID -> .env(隱藏敏感資訊)

// 引入 Restaurant Model
const db = require("../models")
const Restaurant = db.Restaurant
const User = db.User
const Category = db.Category

// 引入 multer 套件的 fs 模組
const fs = require("fs")
const { userInfo } = require("os")

// 引入 service/adminService.js
const adminService = require("../services/adminService.js")

const adminController = {
  // [Read]瀏覽全部餐廳資料：
  // (1) 為一個 function，負責[瀏覽餐廳頁面]，render -> restaurants 的 Handlebars。
  // (2) 為Controller(adminController)內的一個 Action。
  getRestaurants: (req, res) => {
    // .findAll({ raw: true })：查找全部、轉成 plain object。
    // return Restaurant.findAll({
    //   raw: true,
    //   nest: true,
    //   // 對應 const Category = db.Category
    //   // 注意：include: [Model]：
    //   // 1. include 同時代入[Model]和 有關聯的 Model Data。
    //   // 2. 將 Category 傳給 Restaurant.findAll，render -> Handlebars。
    //   include: [{ model: Category }]
    // })
    //   .then(restaurants => {
    //     // 檢查 include: [Category]
    //     // console.log(restaurants)

    //     // adminController.js 和 admin[Folder] 同一層
    //     return res.render("admin/restaurants", { restaurants: restaurants })
    //   })
    adminService.getRestaurants(req, res, (data) => {
      return res.render("admin/restaurants", (data))
    })
  },

  // [Create]新增一筆餐廳資料(1)：render -> create 頁面 [顯示頁面，非功能(POST動作)]
  createRestaurant: (req, res) => {
    Category.findAll({
      raw: true,
      nest: true
    })
      .then(categories => {
        return res.render("admin/create.handlebars", {
          categories: categories
        })
      })
  },

  // [Create]新增一筆餐廳資料(2)：create 功能 [POST]
  postRestaurant: (req, res) => {
    if (!req.body.name) {
      req.flash("error_messages", `Name didn't exist`)
      // 注意：res.redirect("back")：
      // POST 動作結束後，若未填 name，則導回原 create 頁面("admin/create")。
      return res.redirect("back")
    }
    // destructuring(解構賦值)：const file = req.file
    // const { file } = req
    // // 1. 若有圖片：
    // if (file) {
    //   // 2. fs(file system)[node.js 內建讀檔 模組]：讀取 [temp 資料夾]內 圖片
    //   fs.readFile(file.path, (err, data) => {
    //     if (err) console.log('Error: ', err)

    //     // 3. 寫入正式 [upload 資料夾]
    //     fs.writeFile(`upload/${file.originalname}`, data, () => {
    //       // 4. 將 "檔案路徑" 寫入 restaurant.image。
    //       return Restaurant.create({
    //         name: req.body.name,
    //         tel: req.body.tel,
    //         address: req.body.address,
    //         opening_hours: req.body.opening_hours,
    //         description: req.body.description,
    //         image: file ? `/upload/${file.originalname}` : null
    //       })

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
        return Restaurant.create({
          name: req.body.name,
          tel: req.body.tel,
          address: req.body.address,
          opening_hours: req.body.opening_hours,
          description: req.body.description,

          // img.fata.link：取得上傳圖片後的 URL。上傳成功後 http://img.data.link/ 會是剛剛上傳後拿到的圖片網址。
          image: file ? img.data.link : null,

          CategoryId: req.body.CategoryId
        })
          .then(restaurant => {
            req.flash('success_messages', 'restaurant was successfully created')

            return res.redirect('/admin/restaurants')
          })
      })
    }
    else {
      // Restaurant Model 建立一個新 restaurant，並將表單傳來的資料(req.body.XXX)填入新的 restaurant。
      return Restaurant.create({
        name: req.body.name,
        tel: req.body.tel,
        address: req.body.address,
        opening_hours: req.body.opening_hours,
        description: req.body.description,
        image: null,
        CategoryId: req.body.CategoryId
      })
        .then(restaurant => {
          req.flash('success_messages', 'restaurant was successfully created')
          // 重新導回後台首頁，立即看到新增後的結果。
          return res.redirect('/admin/restaurants')
        })
    }
  },

  // [Read]瀏覽一筆餐廳資料：動態路由:id -> req.params.id
  getRestaurant: (req, res) => {
    // req.params.id：從 Route 傳過來的參數
    // {raw: true}：轉換成 JS plain object。
    return Restaurant.findByPk(req.params.id, {
      // 注意：不可加 raw: true, 改加 .toJSON()。
      include: [Category]
    })
      .then(restaurant => {
        // 檢查 include: [Category]
        // console.log(restaurant)

        return res.render("admin/restaurant.handlebars", { restaurant: restaurant.toJSON() })
      })
  },

  // [Update]編輯一筆餐廳資料(1)：render -> create 頁面
  editRestaurant: (req, res) => {

    Category.findAll({
      raw: true,
      nest: true
    })
      .then(categories => {
        return Restaurant.findByPk(req.params.id)
          .then(restaurant => {
            // 注意：render -> admin/create 頁面。
            // [Update]和[Create]表單類似，所以在[Create]表單做一點修改，之後只需維護一個表單！
            return res.render("admin/create.handlebars", {
              categories: categories,
              restaurant: restaurant.toJSON()
            })
          })
      })
  },

  // [Update]編輯一筆餐廳資料(2)：Update 功能 [PUT]
  putRestaurant: (req, res) => {
    if (!req.body.name) {
      req.flash("error_messages", `Name didn't exist`)
      return res.redirect("back")
    }

    // const { file } = req
    // if (file) {
    // fs.readFile(file.path, (err, data) => {
    //   if (err) console.log('Error: ', err)

    //   fs.writeFile(`upload/${file.originalname}`, data, () => {
    //     return Restaurant.findByPk(req.params.id)
    //       .then((restaurant) => {
    //         restaurant.update({
    //           name: req.body.name,
    //           tel: req.body.tel,
    //           address: req.body.address,
    //           opening_hours: req.body.opening_hours,
    //           description: req.body.description,
    //           image: file ? `/upload/${file.originalname}` : restaurant.image
    //         })
    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID);
      imgur.upload(file.path, (err, img) => {
        return Restaurant.findByPk(req.params.id)
          .then(restaurant => {
            restaurant.update({
              name: req.body.name,
              tel: req.body.tel,
              address: req.body.address,
              opening_hours: req.body.opening_hours,
              description: req.body.description,
              image: file ? img.data.link : restaurant.image,
              CategoryId: req.body.CategoryId
            })
              .then(restaurant => {
                req.flash('success_messages', 'restaurant was successfully to update')
                res.redirect('/admin/restaurants')
              })
          })
      })
    }
    else {
      return Restaurant.findByPk(req.params.id)
        .then(restaurant => {
          // restaurant.update：Update 資料
          restaurant.update({
            name: req.body.name,
            tel: req.body.tel,
            address: req.body.address,
            opening_hours: req.body.opening_hours,
            description: req.body.description,
            image: restaurant.image,
            CategoryId: req.body.CategoryId
          })
            .then(restaurant => {
              req.flash('success_messages', 'restaurant was successfully to update')

              res.redirect('/admin/restaurants')
            })
        })
    }
  },

  // [Delete]刪除一筆餐廳資料：
  deleteRestaurant: (req, res) => {
    // return Restaurant.findByPk(req.params.id)
    //   .then(restaurant => {
    //     // restaurant.destroy()：刪除
    //     restaurant.destroy()
    //       .then(restaurant => {
    //         res.redirect("/admin/restaurants")
    //       })
    //   })
    // 判斷式：若收到 success，就跳回後台的餐廳總表
    adminService.deleteRestaurant(req, res, (data) => {
      if (data["status"] === "success") {
        res.redirect("/admin/restaurants")
      }
    })
  },
  // Authority 設定(1)：set as user/admin
  getUser: (req, res) => {
    User.findAll({ raw: true, nest: true })
      .then(users => {
        // 理解 isAdmin 狀態切換
        // console.log(users)
        // console.log(users[0].isAdmin)
        // console.log(users[0].isAdmin = !users[0].isAdmin)

        return res.render("admin/users.handlebars", { users: users })
      })
  },
  // // Authority 設定(1)：set as user/admin
  putUser: (req, res) => {
    // 1. 注意：User.findByPk(req.params.id)：此處不可加參數{ raw: true }，否則 Model Instance function[.save()] 失效。
    User.findByPk(req.params.id)
      .then(user => {
        //不須先轉成 plain object，因最後皆由 adminController.getUser 轉換。
        console.log(`user:`, user)

        // 檢驗 isAdmin 切換前
        console.log(`user.isAdmin-BEFORE: `, user.isAdmin)

        // 2. 注意：isAdmin 切換 True/False
        user.isAdmin = !user.isAdmin

        // 檢驗 isAdmin 切換後
        console.log(`user.isAdmin-AFTER: `, user.isAdmin)

        // 3. 官方文件 Model Instance：也可精簡用.save()，自動 update 欄位的 value。
        user.save({ field: "isAdmin" })
          // user.save()
          .then(user => {

            req.flash('success_messages',
              `user "${user.name}" was updated successfully!`)

            res.redirect('/admin/users')
          })
      })
  }
}

// 匯出 restController 物件{}：
// restController 物件會存放在一個同名檔案 restController.js 內，記得在檔案最後一行，使用 module.exports 匯出 restController，之後才能在其他檔案內使用。
module.exports = adminController
