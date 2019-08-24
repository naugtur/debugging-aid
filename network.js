const mitm = require('mitm')()
const { printMap } = require('./lib/print')
const { cleanMitmStack } = require('./lib/cleanStack')

mitm.on('connect', (socket, opts) => {
  const e = {}
  Error.captureStackTrace(e)
  const cleanStack = cleanMitmStack(e.stack)
  printMap('network, outgoing', {
    to: opts.href || (opts.uri && opts.uri.href) || `${opts.protocol}//${opts.host || opts.hostname}:${opts.port}${opts.pathname}`,
    stack: cleanStack.join('\n')
  })
  socket.bypass()
})
