'use strict'

const { getCurrentPosition, getFrames } = require('./lib/cleanStack')
const { printMessage } = require('./lib/print')
const { createHook, executionAsyncId } = require('async_hooks');
const fs = require('fs');
createHook({ init() { } }).enable(); // forces PromiseHooks to be enabled.

const description = { id: 'asId', dt: 'ms ', pos: 'position               ', stackRef: 'full stack  ', msg: 'optional message' }
let log;
let stacks;
let stacksFile;
let currentStacksLine;
let t0;

function init() {
    t0 = undefined
    log = [description]
    stacks = []
    currentStacksLine = 1

    const rand = Math.random().toFixed(3).substring(2)
    stacksFile = `./${rand}.log`
}

function saveStack(stack) {
    const stackRef = `${stacksFile}:${currentStacksLine}`
    const frames = getFrames(stack, 1)
    currentStacksLine += frames.length + 2
    stacks.push('thebugger\n' + frames.join('\n') + '\n')
    return stackRef
}

function hrtime() {
    const t = process.hrtime()
    return (t[0] * 1000000 + t[1] / 1000) / 1000
}

function pad(text, max = 5) {
    text = '' + text
    const num = Math.max(0, (max - text.length))
    return ' '.repeat(num) + text;
}

function printLog({ id, dt, pos, stackRef, msg }) {
    msg = msg === undefined ? '' : `\n                              |   ${msg}`
    return (`|${pad(dt,7)}${pad(id,5)} |${pad(stackRef,stacksFile.length+5)} | ${pos}  ${msg} `)
}
function flush() {
    printMessage('\n' + log.map(printLog).join('\n'))
    fs.writeFileSync(stacksFile, stacks.join('\n'))
    init()
}
const buggerCall = (msg) => {
    if (!t0) {
        t0 = hrtime()
    }
    const dt = hrtime() - t0
    const stack = (Error()).stack
    const stackRef = saveStack(stack)
    const pos = getCurrentPosition(stack, 1)
    log.push({ id: executionAsyncId(), dt: dt.toFixed(2), pos, stackRef, msg })

}

init()
Object.defineProperty(globalThis, 'thebugger', {
    enumerable: false,
    writeable: false,
    get: () => {
        buggerCall();
        return flush;
    },
    set: (v) => {
        buggerCall(v)
    }
})

process.on('beforeExit', () => {
    flush()
})
