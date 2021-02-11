const db = require("../models")
const Comment = db.Comment

const commentController = {
  // [Create/POST]新增評論
  postComment: (req, res) => {
    // console.log("req.params", req.params)
    // console.log("req.body", req.body)
    // console.log("req.user", req.user)

    // Model.create：Database 產生一筆新 Comment Data。
    return Comment.create({
      // 評論的內容來自使用者在表單裡輸入的內容，因此需要從 res.body.text 裡取得，之後做表單時要記得定義 text 這個名稱
      text: req.body.text,

      // 注意：此處找 FK Id，用req.body、非req.params。
      // RestaurantId：對應表單 name。
      RestaurantId: req.body.restaurantId,
      // UserId：直接從 Passport 套件提供的 req.user。
      UserId: req.user.id
    })
      .then(comment => {
        res.redirect("/restaurants/${req.body.restaurantId}")
      })
  }
}

module.exports = commentController


