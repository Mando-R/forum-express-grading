// 因為路徑多加了一層 /api，如果用複製貼上大法，需要注意路徑的更動，例如
const db = require("../../models")
const Restaurant = db.Restaurant
const Category = db.Category

// 引入 service/adminService.js
const adminService = require("../../services/adminService.js")

const adminController = {
  getRestaurants: (req, res) => {
    // return Restaurant.findAll({
    //   raw: true,
    //   nest: true,
    //   include: [{ model: Category }]
    // })
    //   .then(restaurants => {
    //     return res.json({ restaurants: restaurants })
    //   })
    adminService.getRestaurants(req, res, (data) => {
      return res.json(data)
    })
  },

  deleteRestaurant: (req, res) => {
    // return Restaurant.findByPk(req.params.id)
    //   .then(restaurant => {
    //     restaurant.destroy()
    //       .then(restaurant => {
    //         // res.redirect("/admin/restaurants")
    //         // 注意：.json({ ststus: "表達成功/失敗，也可使用 HTTP 狀態碼", message: "補充說明更多細節" })
    //         res.json({ ststus: "success", message: "" })
    //       })
    //   })
    adminService.deleteRestaurant(req, res, (data) => {
      return res.json(data)
    })
  },


}

module.exports = adminController

