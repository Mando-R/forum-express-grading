// 注意：
// 1. Handlebars: Don’t use ES6 "arrow functions" to define "helpers"
// 2. 只要本層 {#each Array} ＋ 內層 this(指向本層Array)，{#ifCond}就必須搭配 ../b，脫離本層Array(this)，往上層接收原始 Data。
// 例如：{{#ifCond this.id ../categoryId}}。

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