// 因為路徑多加了一層 /api，如果用複製貼上大法，需要注意路徑的更動，例如
const db = require("../../models")
const Restaurant = db.Restaurant
const Category = db.Category

const adminController = {
  getRestaurants: (req, res) => {
    return Restaurant.findAll({
      raw: true,
      nest: true,
      include: [{ model: Category }]
    })
      .then(restaurants => {
        return res.json({ restaurants: restaurants })
      })
  }
}

module.exports = adminController