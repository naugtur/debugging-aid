const moduleName = process.env.AID_MODULE
const Module = require('module')
const { cleanLoadStack } = require('./lib/cleanStack')
const { printMessage } = require('./lib/print')

if (!moduleName) {
  printMessage('You need to set this env variable: AID_MODULE=somenameorpath ')
}

let localCache
Object.defineProperty(Module._cache, moduleName, {
  configurable: false,
  get () {
    const e = {}
    Error.stackTraceLimit = Infinity
    Error.captureStackTrace(e)
    const loadStack = cleanLoadStack(e.stack)
    printMessage(`module cache hit for '${moduleName}' ${loadStack.join('\n')}`)
    return localCache
  },
  set (newValue) {
    printMessage(`cache populated for '${moduleName}'`)
    localCache = newValue
  }
})
