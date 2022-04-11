'use strict'

const { getCurrentPosition, getFrames } = require('./lib/cleanStack')
const { printMessage } = require('./lib/print')
const { createHook, executionAsyncId } = require('async_hooks');
const path = require('path');
const fs = require('fs');
const util = require('util');
createHook({ init() { } }).enable(); // forces PromiseHooks to be enabled.
const CWD = process.cwd()
const description = { id: 'asId', dt: 'ms ', pos: 'position               ', stackRef: 'stack & data', snip: 'data snip' }
let log;
let stacks;
let stacksFile = `./${Math.random().toFixed(3).substring(2)}.log`;
let t0;
let snipUsed;

function init() {
    t0 = undefined
    log = []
    stacks = []
    snipUsed = false
}

function saveStack({ stack, data, id, snip, pos, dt }) {
    const frames = getFrames(stack)
    const payload = `## [${dt} ${id}] ${snip} ${pos}
DATA:
${util.inspect(data, { depth: 10 })}
STACK:
${frames.join('\n')}
--------------------------------------------------------------
`
    stacks.push(payload)
}

function hrtime() {
    const t = process.hrtime()
    return (t[0] * 1000000 + t[1] / 1000) / 1000
}

function pad(text, max = 5) {
    text = '' + text
    const num = Math.max(0, (max - text.length))
    return text + ' '.repeat(num);
}

function printLog({ id, dt, pos, stackRef, snip }) {
    snip = snipUsed ? pad(snip, 12) + '|' : ''
    return (`|${pad(dt, 7)}${pad(id, 5)}| ${pad(stackRef, stacksFile.length + 5)}|${snip} ${pos}`)
}

function printLogLong(data) {
    data.stackRef = pad(path.resolve(CWD, data.stackRef), CWD.length + stacksFile.length + 5)
    return printLog(data)
}

let currentStacksLine = 1
function flush() {
    const logWithRefs = log.map((item, index) => {
        item.stackRef = `${stacksFile}:${currentStacksLine}`;
        currentStacksLine += ((stacks[index] || '').match(/\n/g) || '').length + 1;
        return item;
    })

    const logLocation = `[ ${path.resolve(CWD, stacksFile)}:${currentStacksLine} ]`
    printMessage(logLocation + '\n' + printLog(description) + '\n' + logWithRefs.map(printLog).join('\n'))

    const table = [printLog(description), ...logWithRefs.map(printLogLong)]
    fs.writeFileSync(stacksFile, `${stacks.join('\n')}
${table.join('\n')}
`)
    currentStacksLine += table.length + 1


    init()
}

const undoPrevious = () => {
    stacks.pop()
    log.pop()
    return true
}
const buggerCall = (stack, data, moreData) => {
    if (!t0) {
        t0 = hrtime()
    }
    const dt = (hrtime() - t0).toFixed(2)
    const id = executionAsyncId()

    const pos = getCurrentPosition(stack)
    let snip = ''
    if (typeof data !== 'undefined') {
        snipUsed = true
        if (typeof data === 'string') {
            snip = data.substring(0, 12)
            if (moreData) {
                data = moreData
            }
        } else {
            snip = '{!}'
        }
    }
    saveStack({ stack, id, dt, pos, snip, data })
    log.push({ id, dt: dt, pos, snip })

}

const traceAccess = (stack, obj) => {
    const objid = Math.random().toFixed(4).substring(2);
    buggerCall(stack, `trace${objid}`)
    return new Proxy(obj, {
        get(t, p) {
            const stack = (Error()).stack
            const v = t[p]
            buggerCall(stack, `«{${objid}}.${p}`, { [`{${objid}}.${p}`]: v })
            return v
        },
        set(t, p, v) {
            const stack = (Error()).stack
            buggerCall(stack, `»{${objid}}.${p}`, { [`{${objid}}.${p}`]: v })
            t[p] = v
            return true
        }
    })
}

init()
Object.defineProperty(globalThis, 'thebugger', {
    enumerable: false,
    writeable: false,
    get: () => {
        const stack = (Error()).stack
        // So I made it still possible to just call `thebugger;` without calling any of the methods and avoided doubling the entries later. 
        // Was it worth it? I just love the look of a line saying thebugger; even if it's the worst feature.
        buggerCall(stack);
        const api = (v, more) => (undoPrevious() && buggerCall(stack, v, more));
        api.data = (v, more) => (undoPrevious() && buggerCall(stack, v, more));
        api.flush = flush;
        api.conditional = (condition, v, more) => (undoPrevious() && condition && buggerCall(stack, v, more));
        api.traceAccess = (obj) => (undoPrevious() && traceAccess(stack, obj));
        return api;
    },
    set: (v) => {
        const stack = (Error()).stack
        buggerCall(stack, v)
        return true;
    }
})

process.on('beforeExit', () => {
    flush()
})
