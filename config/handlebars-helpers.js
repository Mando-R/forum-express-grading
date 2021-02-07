// 注意：Handlebars: Don’t use ES6 "arrow functions" to define "helpers"
module.exports = {
  ifCond: function (a, b, options) {
    if (a === b) {
      return options.fn(this)
    }
    // return options.inverse(this)
    else {
      return options.inverse(this)
    }
  }
}