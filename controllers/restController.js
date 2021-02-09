// 引入 Restaurant Model
const db = require("../models")
const Restaurant = db.Restaurant
const Category = db.Category


// 抽取 req 處理程序至 controller 內。

// restController：
// 1. 為一個 Controller 的名稱。
// 2. 為一個 Object{}。
// 3. 有不同Object屬性：如 getRestaurants。
const restController = {
  // [Read]瀏覽 全部 餐廳
  // (1) 為一個 function，負責[瀏覽餐廳頁面]，render -> restaurants 的 Handlebars。
  // (2) 為Controller(restController)內的一個 Action。
  getRestaurants: (req, res) => {
    // whereQuery = {}：建立傳入 findAll 的參數，包裝成物件{}。
    const whereQuery = {}

    // 放入 whereQuery = {} 內的 function
    let categoryId = ""
    // 對照 restaurants.handlebars 的 href="?categoryId={{this.id}}：若 request 內含 categoryId
    if (req.query.categoryId) {
      // 將 req.query.categoryId 從 String 轉成 Nunber，才能傳入 Sequelize 的 findAll()的 where 參數。
      categoryId = Number(req.query.categoryId)
      // 將 categoryId 存入 whereQuery 物件{}。
      whereQuery.CategoryId = categoryId
    }

    Restaurant.findAll({
      // include：一併拿出關聯的 Category model。
      include: Category,
      // where：傳入 where 篩選結果，必須為物件{}。
      where: whereQuery
    })
      .then(restaurants => {
        // 外層：restaurant(Array[])、中層：dataValues(Object{})、內層：id 等 Data。
        // (1) ...：spread operator(展開運算子)，「展開」資料，用於String、Array[]、Object{}。
        // (2) Sequelize 回傳 Model Instance(Object{}結構)時，外層用 dataValues 屬性包裝。
        // console.log("restaurants Array[]:", restaurants)
        // console.log(`------------------------`)
        // console.log("restaurants Object{}:", restaurants[0])
        // console.log(`------------------------`)
        // console.log(restaurants[0].dataValues)
        // console.log(`------------------------`)

        // .map(物件, index, array =>{})：與 forEach 非常類似，但 map 會 return 一個值，並產生一個【新array】。
        const data = restaurants.map(restaurant => ({
          // (1) ...：spread operator 展開至中層 restaurant.dataValues。
          ...restaurant.dataValues,

          // (2) 展開中層 restaurant.dataValues 後，取得 restaurant.dataValues.description 並 重新代入複寫。
          description: restaurant.dataValues.description.substring(0, 50), // 文字截斷為 50 字元長度

          // (3) render -> Handlebars：
          // 注意 categoryName 設定，由於新版 Handlebars 限制直接把特殊物件傳給前端樣板，現需在後端 controller 裡整理好所有要用到的資料。

          // 因此改成直新增給定 categoryName 屬性，把類別名稱放進來：categoryName: r.Category.name
          categoryName: restaurant.Category.name
        }))
        // 注意：檢查 categoryName
        // console.log(data[0])

        Category.findAll({
          raw: true,
          nest: true
        })
          .then(categories => {
            return res.render("restaurants.handlebars", {
              restaurants: data,
              categories: categories,
              categoryId: categoryId
            })
          })
      })
  },
  // [Read]瀏覽 單一 餐廳
  getRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id, {
      include: Category
    })
      .then(restaurant => {
        // console.log(restaurant)

        return res.render("restaurant.handlebars", {
          restaurant: restaurant.toJSON()
        })
      })
  },

  // [Read]依分類篩選餐廳總表



}

// 匯出 restController 物件{}：
// restController 物件會存放在一個同名檔案 restController.js 內，記得在檔案最後一行，使用 module.exports 匯出 restController，之後才能在其他檔案內使用。
module.exports = restController



