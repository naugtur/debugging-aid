'use strict'
const slow = require('./helper.slowfunc')

module.exports = function start () {
  Promise.all([
    Promise.resolve(1)
      .then(a => a++)
      .then(a => [a])
      .then(a => a.join(',').repeat(50).split(','))
      .then(a => {
        a[0] = 1
        slow()
        return a
      })
      .catch(console.error),
    Promise.resolve(1)
      .then(a => a++)
      .then(a => [a])
      .then(a => a.join(',').repeat(50).split(','))
      .then(function aNamedFunction (a) {
        a[0] = 1
        return slow()
      })
      .catch(console.error)
  ])
}
