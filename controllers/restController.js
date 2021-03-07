// 引入 Restaurant Model
const db = require("../models")
// const favorite = require("../models/favorite")
const Restaurant = db.Restaurant
const Category = db.Category
const Comment = db.Comment
const User = db.User
const Favorite = db.Favorite

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
      include: [{ model: Category }],
      // include: Category,
      // 條件2. where(Category／categoryId)：傳入 where 篩選結果，必須為物件{}。
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
        // console.log("results.row", results.rows)
        // 注意：Sequelize API reference－Model.findAndCountAll：return results 包含{1.count：篩選出的數量、2. rows(Array)：篩選後的 Data}
        // 1. .findAndCountAll{參數} 已篩選 results(Array)。
        // 2. rows：rows(Array)層，包裝篩選後的所有 Data。
        // 3. .map(物件, index, array =>{})：與 forEach 非常類似，但 map 會 return 一個值，並產生一個【新array】。
        const data = results.rows.map(restaurant => ({
          // (1) ...：spread operator 展開至中層 restaurant.dataValues。
          ...restaurant.dataValues,

          // (2) 展開中層 restaurant.dataValues 後，取得 restaurant.dataValues.description 並 重新代入description複寫。
          description: restaurant.dataValues.description.substring(0, 50), // 文字截斷為 50 字元長度

          // (3) render -> Handlebars：
          // 注意 categoryName 設定，由於新版 Handlebars 限制直接把特殊物件傳給前端樣板，現需在後端 controller 裡整理好所有要用到的資料。
          // 因此改成直新增命名 categoryName 屬性，把類別名稱放進來：categoryName: r.Category.name
          categoryName: restaurant.dataValues.Category.name,

          // (4) 注意：passport.js 設定 passport.deserializeUser[Eager Loading] 放入 req.user(isFavorited、isLiked)
          isFavorited: req.user.FavoritedRestaurants.map(favoritedRestaurant => favoritedRestaurant.id).includes(restaurant.dataValues.id),

          isLiked: req.user.LikedRestaurants.map(LikedRestaurant => LikedRestaurant.id).includes(restaurant.dataValues.id)
          // Passport套件的req.user(註1)，其內部有一陣列[]FavoritedRestaurants，該陣列[]包含多筆餐廳資料物件{}(我命名為單數FavoritedRestaurant)，若該陣列[]內每一筆物件FavoritedRestaurant的id，包含(includes() 註2)原本Database內Restaurant Table的id，則 return TRUE，反之為False。
          // 註1：已先在passport.js設定include:{ model: Restaurant, as: "FavoritedRestaurants" }，表示透過User.findByPk(id...)，以UserId查找User資料同時，該User資料(req.user)內層也包含(include)和UserId相關聯的Restaurant資料。
          // 註2：includes()：The includes() method determines whether an array includes a certain value among its entries, returning TRUE or FALSE as appropriate.
        }))
        // console.log("req.user", req.user)
        // console.log("------------------")
        // console.log("req.user[0]", req.user[0])
        // console.log("------------------")
        // console.log("data[0]", data[0])

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
    // Main Model：1.Restaurant Table(FK:CategoryId)
    // Associated Model：2.Comment Table(FK:RestaurantsId、FK:UserId)、3.User Table
    return Restaurant.findByPk(req.params.id, {
      // 注意：include 項目變多時，改用 Array[]。
      include: [
        { model: Category },
        { model: Comment, include: [{ model: User }] },
        // isFavorited
        { model: User, as: "FavoritedUsers" },
        // isLiked
        { model: User, as: "LikedUsers" },
      ]
    })
      .then(restaurant => {
        // console.log(`-------------------------------`)
        // console.log(`restaurant`, restaurant)
        // console.log(`-------------------------------`)
        // console.log(`restaurant.Comments[0]`, restaurant.Comments[0])
        // console.log(`-------------------------------`)
        // console.log(restaurant.Comments[0].dataValues)
        // console.log(`-------------------------------`)
        // console.log(restaurant.Comments[0].dataValues.UserId)
        // Passport套件的req.user(註1) ，其內部有一陣列[] FavoritedRestaurants，該陣列[]包含多筆餐廳資料物件{ } (我命名為單數favoritedRestaurant) ，若該陣列[]內每一筆物件favoritedRestaurant的id，includes()(註2) 原本Database內Restaurant Table的id，則 return TRUE，反之為False。
        const isFavorited = restaurant.FavoritedUsers.map(favoritedRestaurant => favoritedRestaurant.id).includes(req.user.id)

        const isLiked = restaurant.LikedUsers.map(LikedUser => LikedUser.id).includes(req.user.id)
        console.log("restaurant", restaurant)
        // console.log("------------------")
        // console.log("restaurant.FavoritedUsers", restaurant.FavoritedUsers)
        // console.log("------------------")
        // console.log("restaurant.FavoritedUsers[0]", restaurant.FavoritedUsers[0])
        // console.log("------------------")
        // console.log("restaurant.FavoritedUsers[0].id", restaurant.FavoritedUsers[0].id)
        return res.render("restaurant.handlebars", {
          restaurant: restaurant.toJSON(),
          isFavorited: isFavorited,
          isLiked: isLiked
        })
      })
  },

  // Dashboard
  getDashboard: (req, res) => {
    return Restaurant.findByPk(req.params.id, {
      include: [
        { model: Category },
        { model: Comment, include: [{ model: User }] }
      ]
    })
      .then(restaurant => {
        // console.log("restaurant", restaurant)
        // console.log("restaurant.viewCounts", restaurant.viewCounts)
        // console.log("restaurant.name", restaurant.name)
        // 計算 viewCounts：
        // 1..update() 組合：最精簡
        restaurant.update({
          viewCounts: restaurant.viewCounts += 1
        })
          .then(restaurant => {
            // console.log("restaurant.viewCounts", restaurant.viewCounts)
            return res.render("dashboard.handlebars", { restaurant: restaurant.toJSON() })
          })

        // 2. .save() 組合：3 種寫法：
        // (1) ?：3 元運算子
        //// restaurant.viewCounts = restaurant.viewCounts ? restaurant.viewCounts + 1 : 0
        // (2) 冗長
        //// restaurant.viewCounts = restaurant.viewCounts + 1
        // (3) 精簡
        ////restaurant.viewCounts += 1
        //   restaurant.save()
        //     .then(restaurant => {

        //       console.log("restaurant.viewCounts", restaurant.viewCounts)

        //       return res.render("dashboard.handlebars", { restaurant: restaurant.toJSON() })
        //     })
      })
  },

  // Top 10 Favorited Restaurants
  getTopRest: (req, res) => {
    // 寫法一、Restaurant.findAll 撈出全部 data
    return Restaurant.findAll({
      include: [
        { model: User, as: "FavoritedUsers" }
      ]
    })
      .then(restaurants => {
        // 整理 users 資料
        restaurants = restaurants.map(restaurant => ({
          ...restaurant.dataValues,
          // restaurant 物件{}內，新增 FavoriteCount ，計算追蹤者人數。
          FavoriteCount: restaurant.FavoritedUsers.length,
          // 判斷目前登入使用者(req.user)是否已追蹤該 User 物件
          isFavorited: req.user.FavoritedRestaurants.map(FavoritedRestaurant => FavoritedRestaurant.id).includes(restaurant.dataValues.id)
        }))
        // console.log("req.user", req.user)
        // console.log("------------------")
        // console.log("restaurants[0].FavoritedUsers", restaurants[0].FavoritedUsers)
        // console.log("restaurants[0].FavoritedUsers.length", restaurants[0].FavoritedUsers.length)

        // .sort()：依照 先前放入的 FavoriteCount 排序
        restaurants = restaurants.sort((a, b) => b.FavoriteCount - a.FavoriteCount)
        // slice()：切出前 10 筆
        const top10FavRest = restaurants.slice(0, 10)

        return res.render("topRest.handlebars", { restaurants: top10FavRest })
      })

    // 寫法二、嘗試優化但失敗。嘗試方式為先直接處理 Favorite Table(用count篩選和排序)，找出 Top 10 的 RestaurantId，再以此找出 10 Restaurant。
    // 推測效能應該較好，但出現 Top 10 Restaurant 無法依據 Favorite 數量更新的問題，研究Table結構和之前的Controller，推測主因為點擊Favotire後，Sequelize處理 Favorite Table 的速度，快於新的RestaurantId 產生(加入最愛)或減少(移除最愛)的速度。
    // (1) Favorite 先 count 前 10 筆 RestaurantId，之後(2) Restaurant.findAll 再撈出 該 10 筆，避免一次處理全部 Restaurant。
    // return Favorite.count({
    //   group: ["RestaurantId"]
    // })
    //   .then(favoriteRest => {
    //     // .sort()：排序 大 -> 小
    //     favoriteRest.sort((a, b) => {
    //       return b.count - a.count
    //     })
    //     // .slice()：切出 前 10 筆
    //     const top10FavRest = favoriteRest.slice(0, 10)
    //     // .map()：抓出 RestaurantId，並產生新 Array。
    //     const top10FavRestId = top10FavRest.map((item, index) => { return item.RestaurantId })
    //     // 用 id (top10favRestId) 找出該 10 筆 Restaurant
    //     Restaurant.findAll({
    //       where: { id: top10FavRestId },
    //       include: [
    //         { model: User, as: "FavoritedUsers" }
    //       ]
    //     })
    //       .then(restaurants => {
    //         // 整理 restaurants 資料
    //         restaurants = restaurants.map(restaurant => ({
    //           ...restaurant.dataValues,
    //           // 在 restaurant物件{}內，新增 FavoriteCount，計算追蹤者人數。
    //           FavoriteCount: restaurant.FavoritedUsers.length,
    //           // 判斷目前登入使用者(req.user)是否已追蹤該 User 物件
    //           isFavorited: req.user.FavoritedRestaurants.map(FavoritedRestaurant => FavoritedRestaurant.id).includes(restaurant.dataValues.id)
    //         }))
    //         return res.render("topRest.handlebars", { restaurants: restaurants })
    //       })
    //   })
  },

  // Odering：2. 迭代：getFeeds 改寫 Promise.all
  // "1. 傳統.then()寫法" 流程中先呼叫 Restaurant.findAll，等 Restaurant.findAll 執行結束後，才在後續.then()流程呼叫 Comment.findAll。

  // 然而，此案例中 Restaurant 和 Comment 撈資料順序，並無依賴關係，只是受到.then()語法限制，被迫產生一個「順序」。

  // 如此造成，「取 restaurant 資料」動作block(阻塞)「取 comment 資料」，使後者必須等待。

  // 假設查表動作一律 2 秒，整個過程就需 4 秒。若能讓兩個動作同時發生，就可使操作時間維持 2 秒。（此處秒數是舉例說明，不代表真實情況）
  getFeeds: (req, res) => {
    // Promise.all([Model 1、Model 2])：2個Model動作，非同步(同時)執行。
    return Promise.all([
      // 1. 取得 restaurants
      Restaurant.findAll({
        // Plain Object
        raw: true,
        nest: true,
        // Odering
        limit: 10,
        order: [["createdAt", "DESC"]],
        // include Model
        include: [{ model: Category }],
        // Plain Object
      }),
      // 2. 取得 comments
      Comment.findAll({
        // Plain Object
        raw: true,
        nest: true,
        // Odering
        limit: 10,
        order: [["createdAt", "DESC"]],
        // include Model：注意 個別 Model，有個別物件{}。
        include: [
          { model: User },
          { model: Restaurant }
        ]
      })
    ])
      .then(([restaurants, comments]) => {
        // console.log("restaurants[0]", restaurants[0])
        // console.log("comments[0]", comments[0])
        // console.log("comments", comments)
        return res.render("feeds.handlebars", {
          restaurants: restaurants,
          comments: comments
        })
      })
  }
  // Odering：1. 傳統.then()寫法
  // getFeeds: (req, res) => {
  //   // Restaurant.findAll：前10筆
  //   return Restaurant.findAll({
  //     // Plain Object
  //     raw: true,
  //     nest: true,
  //     // Odering
  //     limit: 10,
  //     order: [["createdAt", "DESC"]],
  //     // include Model
  //     include: [{ model: Category }]
  //   })
  //     .then(restaurants => {
  //       console.log("restaurants[0]", restaurants[0])

  //       // Comment.findAll：前10筆
  //       Comment.findAll({
  //         // Plain Object
  //         raw: true,
  //         nest: true,
  //         // Odering
  //         limit: 10,
  //         order: [["createdAt", "DESC"]],
  //         // include Model
  //         // include: [{ model: User}, { model: Restaurant }]
  //         include: [{ model: Restaurant }]
  //       })
  //         .then(comments => {
  //           console.log("comments[0]", comments[0])
  //           console.log("comments", comments)

  //           return res.render("feeds", {
  //             // 此 restaurants 為 Restaurant.findAll 結果
  //             restaurants: restaurants,
  //             // 此 comments 為 Comment.findAll 結果，包含關聯的 User 和 Restaurant。
  //             comments: comments
  //           })
  //         })
  //     })
  // },
}

// 匯出 restController 物件{}：
// 注意：restController 物件會存放在一個同名檔案 restController.js 內，記得在檔案最後一行，使用 module.exports 匯出 restController，之後才能在其他檔案內使用。
module.exports = restController



