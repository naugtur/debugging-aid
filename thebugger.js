'use strict'

const { getCurrentPosition, getFrames } = require('./lib/cleanStack')
const { printMessage } = require('./lib/print')
const { createHook, executionAsyncId } = require('async_hooks');
const fs = require('fs');
const util = require('util');
createHook({ init() { } }).enable(); // forces PromiseHooks to be enabled.

const description = { id: 'asId', dt: 'ms ', pos: 'position               ', stackRef: 'stack & data', snip: 'data snip' }
let log;
let stacks;
let stacksFile;
let currentStacksLine;
let t0;
let snipUsed;

function init() {
    t0 = undefined
    log = [description]
    stacks = []
    currentStacksLine = 1
    snipUsed = false

    const rand = Math.random().toFixed(3).substring(2)
    stacksFile = `./${rand}.log`
}

function saveStack(stack, data) {
    const stackRef = `${stacksFile}:${currentStacksLine}`
    const frames = getFrames(stack, 1)
    const payload = `DATA:
${util.inspect(data, { depth: 10 })}
STACK:
${frames.join('\n')}
`
    const lines = (payload.match(/\n/g) || '').length + 1

    currentStacksLine += lines
    stacks.push(payload)
    return stackRef
}

function hrtime() {
    const t = process.hrtime()
    return (t[0] * 1000000 + t[1] / 1000) / 1000
}

function pad(text, max = 5) {
    text = '' + text
    const num = Math.max(0, (max - text.length))
    return text + ' '.repeat(num) ;
}

function printLog({ id, dt, pos, stackRef, snip }) {
    snip = snipUsed ? pad(snip, 10) + '|' : ''
    return (`|${pad(dt, 7)}${pad(id, 5)}| ${pad(stackRef, stacksFile.length + 5)}|${snip} ${pos}`)
}
function flush() {
    printMessage('\n' + log.map(printLog).join('\n'))
    fs.writeFileSync(stacksFile, stacks.join('\n'))
    init()
}
const buggerCall = (data) => {
    if (!t0) {
        t0 = hrtime()
    }
    const dt = hrtime() - t0
    const stack = (Error()).stack
    const stackRef = saveStack(stack, data)
    const pos = getCurrentPosition(stack, 1)
    let snip = ''
    if (typeof data !== 'undefined') {
        snipUsed = true
        if (typeof data === 'string') {
            snip = data.substring(0, 10)
        } else {
            snip = '{!}'
        }
    }
    log.push({ id: executionAsyncId(), dt: dt.toFixed(2), pos, stackRef, snip })

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
