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
  }
}

// 匯出 restController 物件{}：
// restController 物件會存放在一個同名檔案 restController.js 內，記得在檔案最後一行，使用 module.exports 匯出 restController，之後才能在其他檔案內使用。
module.exports = adminController


