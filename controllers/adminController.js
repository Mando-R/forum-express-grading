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

  // 新增一筆餐廳資料(1)：render -> create 頁面 [顯示頁面，非功能(POST動作)]
  createRestaurant: (req, res) => {
    return res.render("admin/create")
  },

  // 新增一筆餐廳資料(2)：create 功能 [POST 動作]
  postRestaurant: (req, res) => {
    if (!req.body.name) {
      req.flash("error_messages", `Name didn't exist`)
      // 注意：POST 動作結束後，若未填 name，則導回原 create 頁面("admin/create")。
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
        req.flash("success_message", `Restaurant was successfully created`)
        // 重新導回後台首頁，立即看到新增後的結果。
        res.redirect("/admin/restaurants")
      })
  }

}

// 匯出 restController 物件{}：
// restController 物件會存放在一個同名檔案 restController.js 內，記得在檔案最後一行，使用 module.exports 匯出 restController，之後才能在其他檔案內使用。
module.exports = adminController


