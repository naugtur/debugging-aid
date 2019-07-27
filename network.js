const mitm = require('mitm')()
const { printMap } = require('./lib/print')
const { cleanMitmStack } = require('./lib/cleanStack')

mitm.on('connect', (socket, opts) => {
  const e = {}
  Error.captureStackTrace(e)
  const cleanStack = cleanMitmStack(e.stack)
  printMap('network, outgoing', {
    href: opts.href,
    stack: cleanStack.join('\n')
  })
  socket.bypass()
})
