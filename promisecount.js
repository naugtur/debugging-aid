const { printMessage } = require('./lib/print')

let count = 0
const asyncHooks = require('async_hooks')
const asyncHook = asyncHooks.createHook({
  init (asyncId, type, triggerAsyncId) {
    if (type === 'PROMISE') {
      count++
    }
  }
})
asyncHook.enable()

process.on('beforeExit', () => {
  printMessage(`promises created: ${count}`)
})
