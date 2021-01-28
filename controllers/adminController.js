// 引入 Restaurant Model
const db = require("../models")
const Restaurant = db.Restaurant

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
    // Restaurant Model 建立一個新 restaurant，並將表單傳來的資料(req.body.XXX)填入新的 restaurant。
    return Restaurant.create({
      name: req.body.name,
      tel: req.body.tel,
      address: req.body.address,
      opening_hours: req.body.opening_hours,
      description: req.body.description
    })
      .then((restaurant) => {
        req.flash("success_messages", `Restaurant was successfully created`)
        // 重新導回後台首頁，立即看到新增後的結果。
        res.redirect("/admin/restaurants.handlebars")
      })
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

    return Restaurant.findByPk(req.params.id)
      .then(restaurant => {
        // restaurant.update：Update 資料
        restaurant.update({
          name: req.body.name,
          tel: req.body.tel,
          address: req.body.address,
          opening_hours: req.body.opening_hours,
          description: req.body.description
        })
          .then(restaurant => {
            req.flash("success_messages", `restaurant was successfully to update`)

            res.redirect("/admin/restaurants")

          })
      })

  }





}

// 匯出 restController 物件{}：
// restController 物件會存放在一個同名檔案 restController.js 內，記得在檔案最後一行，使用 module.exports 匯出 restController，之後才能在其他檔案內使用。
module.exports = adminController


