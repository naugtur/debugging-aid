'use strict'
const slow = require('./helper.slowfunc')
thebugger();
let obj;
const d = thebugger.traceAccess({ x: 2 })
module.exports = function start() {
  Promise.all([
    Promise.resolve(d)
      .then(z => {
        z.z = 3;
        obj = {};
      }),
    Promise.resolve(1)
      .then(a => a++)
      .then(a => [a])
      .then(a => a.join(',').repeat(50).split(','))
      .then(a => {
        thebugger;
        a[0] = 1;
        a[1] = d.x;
        slow()
        thebugger = 'after';
        return a
      })
      .catch(console.error),
    Promise.resolve(1)
      .then(a => a++)
      .then(a => [a])
      .then(a => a.join(',').repeat(50).split(','))
      .then(function aNamedFunction(a) {
        thebugger({a});
        a[0] = 1
        d.y = 1
        return slow()
      })
      .catch(console.error)
  ]).then((results) => {
    thebugger;
  })
}
