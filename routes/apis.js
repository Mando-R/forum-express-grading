const express = require("express")
const router = express.Router()

const adminController = require("../controllers/api/adminController.js")

router.get("/admin/restaurants", adminController.getRestaurants)

router.delete("/admin/restaurants/:id", adminController.deleteRestaurant)

module.exports = router
