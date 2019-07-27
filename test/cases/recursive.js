'use strict'
const slow = require('./helper.slowfunc')
module.exports = function start () {
  setImmediate(function recursive (remaining) {
    if (remaining === 0) return slow()
    setImmediate(recursive, remaining - 1)
  }, 2500)
}
