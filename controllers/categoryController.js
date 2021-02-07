const db = require("../models")
const Category = db.Category

const categoryController = {
  // [Read]瀏覽 Category
  getCategories: (req, res) => {
    return Category.findAll({
      raw: true,
      nest: true
    })
      .then(categories => {
        return res.render("admin/categories.handlebars", { categories: categories })
      })
  },

  // [Create]新增 Category
  postCategory: (req, res) => {
    // (1) 若欄位 Name 為空白。 
    if (!req.body.name) {
      req.flash("error_messages", `Name didn't exist`)
      // res.redirect("back")：POST 動作結束後，若未填 name，則導回原頁面。
      return res.redirect("back")
    }
    // (2) 若欄位 Name "非"空白。
    else {
      return Category.create({
        name: req.body.name
      })
        .then(category => {
          req.flash('success_messages', 'Category was successfully created')

          res.redirect("/admin/categories")
        })
    }
  }
}

module.exports = categoryController
