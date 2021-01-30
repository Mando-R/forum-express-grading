// 引入 Restaurant Model
const db = require("../models")
const Restaurant = db.Restaurant

// 引入 multer 套件的 fs 模組
const fs = require("fs")

// 引入 imgur 套件：整合第三方 Imgur API
const imgur = require("imgur-node-api")
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID  // Client ID -> .env(隱藏敏感資訊)

const adminController = {
  // getRestaurants：
  // (1) 為一個 function，負責[瀏覽餐廳頁面]，render -> restaurants 的 Handlebars。
  // (2) 為Controller(adminController)內的一個 Action。
  getRestaurants: (req, res) => {
    // .findAll({ raw: true })：查找全部、轉成 plain object。
    return Restaurant.findAll({ raw: true })
      .then(restaurants => {
        // adminController.js 和 admin[Folder] 同一層
        return res.render("admin/restaurants", { restaurants: restaurants })
      })
  },

  // [Create]新增一筆餐廳資料(1)：render -> create 頁面 [顯示頁面，非功能(POST動作)]
  createRestaurant: (req, res) => {
    return res.render("admin/create.handlebars")
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
        image: null
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
    return Restaurant.findByPk(req.params.id, { raw: true })
      .then(restaurant => {
        return res.render("admin/restaurant.handlebars", { restaurant: restaurant })
      })
  },

  // [Update]編輯一筆餐廳資料(1)：render -> create 頁面
  editRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id, { raw: true })
      .then(restaurant => {
        // 注意：render -> admin/create 頁面。
        // [Update]和[Create]表單類似，所以在[Create]表單做一點修改，之後只需維護一個表單！
        return res.render("admin/create.handlebars", { restaurant: restaurant })
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
        .then((restaurant) => {
          // restaurant.update：Update 資料
          restaurant.update({
            name: req.body.name,
            tel: req.body.tel,
            address: req.body.address,
            opening_hours: req.body.opening_hours,
            description: req.body.description,
            image: restaurant.image
          })
            .then((restaurant) => {
              req.flash('success_messages', 'restaurant was successfully to update')

              res.redirect('/admin/restaurants')
            })
        })
    }
  },

  // [Delete]刪除一筆餐廳資料：
  deleteRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id)
      .then(restaurant => {
        // restaurant.destroy()：刪除
        restaurant.destroy()
          .then(restaurant => {
            res.redirect("/admin/restaurants")
          })
      })
  },





}

// 匯出 restController 物件{}：
// restController 物件會存放在一個同名檔案 restController.js 內，記得在檔案最後一行，使用 module.exports 匯出 restController，之後才能在其他檔案內使用。
module.exports = adminController


