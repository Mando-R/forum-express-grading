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
        if (req.params.id) {
          Category.findByPk(req.params.id)
            .then(category => {
              return res.render("admin/categories.handlebars", {
                // 注意：render categories & category
                categories: categories,
                category: category.toJSON()
              })
            })
        }
        else {
          return res.render("admin/categories.handlebars", { categories: categories })
        }
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
      // Model.create()：新增
      return Category.create({
        name: req.body.name
      })
        .then(category => {
          req.flash('success_messages', `New Category [ ${category.name} ] was successfully created`)

          res.redirect("/admin/categories")
        })
    }
  },

  // [Update]修改 Category
  putCategory: (req, res) => {
    // (1) 若欄位 Name 為空白。
    if (!req.body.name) {
      req.flash("error_messages", `Name didn't exist`)
      return res.redirect("back")
    }
    // (2) 若欄位 Name "非"空白。
    else {
      return Category.findByPk(req.params.id)
        .then(category => {
          req.flash('success_messages', `Category [ ${category.name} ] was successfully updated`)
          // .update()：更新
          category.update(req.body)

            .then(category => {
              res.redirect("/admin/categories")
            })
        })
    }
  },

  // [Delete]刪除 Category
  deleteCategory: (req, res) => {
    return Category.findByPk(req.params.id)
      .then(category => {
        //req.flash('success_messages', `Category [ ${category.name} ] was successfully deleted`)
        // .destroy()：刪除
        category.destroy()
          .then(category => {
            // 注意：req.flash 要放在 res.redirect 前面
            req.flash('success_messages', `Category [ ${category.name} ] was successfully deleted`)

            res.redirect("/admin/categories")
            // req.flash('success_messages', `Category [ ${category.name} ] was successfully deleted`)

          })
      })
  }
}

module.exports = categoryController
