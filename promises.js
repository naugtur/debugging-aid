const { printMap, printMessage } = require('./lib/print')
process.on('multipleResolves', (type, promise, reason) => {
  printMap('multipleResolves', { type, reason })
})

const unhandledRejections = new Map()
let id = 0
process.on('unhandledRejection', (reason, promise) => {
  id++
  unhandledRejections.set(promise, id)
  printMap('unhandledRejection', { id, reason, stack: reason.stack })
})
process.on('rejectionHandled', (promise) => {
  const which = unhandledRejections.get(promise)
  unhandledRejections.delete(promise)
  printMessage(`rejectionHandled id: ${which} (previously reported unhandled, handled with a delay)`)
})
