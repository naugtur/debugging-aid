'use strict'
const asyncHooks = require('async_hooks')
const { performance } = require('perf_hooks')
const { cleanHooksStack } = require('./lib/cleanStack')
const data = new Map()

const debugLog = (title, message) => (process._rawDebug(title, message))

// Error.stackTraceLimit = Infinity
const asyncHook = asyncHooks.createHook({
  init (asyncId, type, triggerAsyncId, resource) {
    const e = {}
    Error.captureStackTrace(e)
    data.set(asyncId, { stack: e.stack })
  },

  before (asyncId) {
    performance.mark('b' + asyncId)
  },

  after (asyncId) {
    performance.mark('a' + asyncId)
    const originalStack = data.get(asyncId).stack
    const where = cleanHooksStack(originalStack)
    debugLog(`stack ${asyncId}`, `${where[0]} ${originalStack}`)
    performance.measure('D' + asyncId + where[0], 'b' + asyncId, 'a' + asyncId)
  }

})

asyncHook.enable()
