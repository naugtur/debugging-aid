// 'use strict'
// const asyncHooks = require('async_hooks')

// const data = new Map()

// Error.stackTraceLimit = Infinity
// const asyncHook = asyncHooks.createHook({
//   init (asyncId, type, triggerAsyncId, resource) {
//     data.add(asyncId, { id: asyncId, parent: triggerAsyncId, name: 'tbd' })
//     const e = {}
//     Error.captureStackTrace(e)
//     debugLog('init', asyncId)
//     cache.set(asyncId, { asyncId, type, stack: e.stack })
//   } })

// const debugLog = (title, message) => (options.debug && process._rawDebug(title, message))

// //   function before (asyncId) {
// //     debugLog('before', asyncId)
// //     if (options.trimFalsePositives) {
// //       continuityId = asyncId
// //     }
// //     const cached = cache.get(asyncId)
// //     if (!cached) { return }
// //     cached.t0 = hrtime()
// //   }

// //   function after (asyncId) {
// //     debugLog('after', asyncId)
// //     if (options.trimFalsePositives && continuityId !== asyncId) {
// //       // drop for interuptions
// //       return
// //     }
// //     const cached = cache.get(asyncId)
// //     if (!cached) { return }
// //     const t1 = hrtime()
// //     const dt = (t1 - cached.t0) / 1000
// //       // process._rawDebug(dt > options.threshold, options.threshold, dt, cached)
// //     if (dt > options.threshold) {
// //       debugLog('stack', cached.stack)
// //       dispatchCallback(dt, cleanStack(cached.stack))
// //     }
// //   }

// //   function destroy (asyncId) {
// //     cache.delete(asyncId)
// //   }

// asyncHook.enable()

// function hrtime () {
//   const t = process.hrtime()
//   return t[0] * 1000000 + t[1] / 1000
// }
