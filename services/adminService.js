const db = require("../models")
const Restaurant = db.Restaurant
const Category = db.Category

const adminService = {
  getRestaurants: (req, res, callbackFunc) => {
    return Restaurant.findAll({
      raw: true,
      nest: true,
      include: [{ model: Category }]
    })
      // 注意：
      // 1. callbackFunc＝(data) => (data) => {return res.render("admin/restaurants", (data))}
      // 2. 其中(data)＝
      .then(restaurants => {
        // return res.render("admin/restaurants", { restaurants: restaurants })
        callbackFunc({ restaurants: restaurants })
      })
  },

  deleteRestaurant: (req, res, callbackFunc) => {
    return Restaurant.findByPk(req.params.id)
      .then(restaurant => {
        restaurant.destroy()
          .then(restaurant => {
            // res.redirect("/admin/restaurants")
            // 注意：.json({ ststus: "表達成功/失敗，也可使用 HTTP 狀態碼", message: "補充說明更多細節" })
            // res.json({ ststus: "success", message: "" })
            callbackFunc({ ststus: "success", message: "" })
          })
      })
  },



}

module.exports = adminService


