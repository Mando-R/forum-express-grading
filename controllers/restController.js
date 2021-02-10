// 引入 Restaurant Model
const db = require("../models")
const Restaurant = db.Restaurant
const Category = db.Category

// Pagination：避免「magic number」(未命名數字)
// Pagination：amountPerPage 限制每頁顯示筆數
const amountPerPage = 10

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
    // Pagination－offset：每次開始計算新一頁時，偏移(換頁)的數量
    let offset = 0
    if (req.query.page) {
      offset = (req.query.page - 1) * amountPerPage
    }

    // whereQuery = {}：建立傳入 findAll 的參數，包裝成物件{}。
    const whereQuery = {}

    // 放入 whereQuery = {} 內的 function
    let categoryId = ""
    // 對照 restaurants.handlebars 的 href="?categoryId={{this.id}}：若 request 內含 categoryId
    if (req.query.categoryId) {
      // 將 req.query.categoryId 從 String 轉成 Nunber，才能傳入 Sequelize 的 findAll()的 where 參數。
      categoryId = Number(req.query.categoryId)
      // 將 categoryId 存入 whereQuery 物件{}。
      whereQuery.categoryId = categoryId
    }

    Restaurant.findAndCountAll({
      // 條件1. include：一併拿出關聯的 Category model。
      include: Category,
      // 條件2. where：傳入 where 篩選結果，必須為物件{}。
      where: whereQuery,
      // 條件3. Pagination
      offset: offset,
      limit: amountPerPage
    })
      // results = 篩選後的 restaurants
      .then(results => {
        // Pagination
        // 1. 若 || 左邊為 false 或 undefined，就取得 || 右邊值(設定第 1 頁)。
        const thePage = Number(req.query.page) || 1
        // console.log("req.query", req.query)
        // console.log("req.query.page", Number(req.query.page))
        // console.log("req.query.categoryId", req.query.categoryId)

        // 2. findAndCountAll 撈 Data 後： 
        // (1)maxPages(最大頁數) = Math.ceil 無條件進位(result.count 餐廳總筆數／pageLimit 每頁筆數)
        const maxPages = Math.ceil(results.count / amountPerPage)

        // (2)totalPage 總頁數：Array.from({length：maxPages最大頁數})產生符合長度的Array，map 代入真正數字(index＋1)，index 從 0 開始計算。
        const totalPage = Array.from({ length: maxPages }).map((item, index) => index + 1)

        //(3)？(三元條件運算子)：前列條件式？True執行式：False執行式
        const prevPage = thePage - 1 < 1 ? 1 : thePage - 1
        const nextPage = thePage + 1 > maxPages ? maxPages : thePage + 1

        // 外層：restaurant(Array[])、中層：dataValues(Object{})、內層：id 等 Data。
        // (1) ...：spread operator(展開運算子)，「展開」資料，用於String、Array[]、Object{}。
        // (2) Sequelize 回傳 Model Instance(Object{}結構)時，外層用 dataValues 屬性包裝。
        // console.log(`------------------------`)
        // console.log("results{count & rows}", results)
        // console.log(`------------------------`)
        // console.log("results.rows", results.rows)
        // console.log(`------------------------`)

        // 注意：Sequelize API reference－Model.findAndCountAll：return results 包含{1.count：篩選出的數量、2. rows(Array)：篩選後的 Data}
        // 1. .findAndCountAll{參數} 已篩選 results(Array)。
        // 2. rows：rows(Array)層，包裝篩選後的所有 Data。
        // 3. .map(物件, index, array =>{})：與 forEach 非常類似，但 map 會 return 一個值，並產生一個【新array】。
        const data = results.rows.map(restaurant => ({
          // (1) ...：spread operator 展開至中層 restaurant.dataValues。
          ...restaurant.dataValues,

          // (2) 展開中層 restaurant.dataValues 後，取得 restaurant.dataValues.description 並 重新代入複寫。
          description: restaurant.dataValues.description.substring(0, 50), // 文字截斷為 50 字元長度

          // (3) render -> Handlebars：
          // 注意 categoryName 設定，由於新版 Handlebars 限制直接把特殊物件傳給前端樣板，現需在後端 controller 裡整理好所有要用到的資料。

          // 因此改成直新增給定 categoryName 屬性，把類別名稱放進來：categoryName: r.Category.name
          categoryName: restaurant.dataValues.Category.name
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
              categoryId: categoryId,
              // Pagination
              thePage: thePage,
              totalPage: totalPage,
              prevPage: prevPage,
              nextPage: nextPage
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
}

// 匯出 restController 物件{}：
// restController 物件會存放在一個同名檔案 restController.js 內，記得在檔案最後一行，使用 module.exports 匯出 restController，之後才能在其他檔案內使用。
module.exports = restController



