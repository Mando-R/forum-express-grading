const express = require("express")
const router = express.Router()

// token 登入機制
const userController = require('../controllers/api/userController.js')

const adminController = require("../controllers/api/adminController.js")

// Router
// token 登入機制
router.post("/signin", userController.signIn)

router.get("/admin/restaurants", adminController.getRestaurants)

router.delete("/admin/restaurants/:id", adminController.deleteRestaurant)


module.exports = router
