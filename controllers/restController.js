// 抽取 req 處理程序至 controller 內。

// restController：
// 1. 為一個 Controller 的名稱。
// 2. 為一個 Object{}。
// 3. 有不同Object屬性：如 getRestaurants。
const restController = {
  // getRestaurants：
  // (1) 為一個 function，負責[瀏覽餐廳頁面]，render -> restaurants 的 Handlebars。
  // (2) 為Controller(restController)內的一個 Action。
  getRestaurants: (req, res) => {
    return res.render("restaurants.handlebars")
  }
}

// 匯出 restController 物件{}：
// restController 物件會存放在一個同名檔案 restController.js 內，記得在檔案最後一行，使用 module.exports 匯出 restController，之後才能在其他檔案內使用。
module.exports = restController



