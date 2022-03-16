'use strict'

const { getCurrentPosition } = require('./lib/cleanStack')
const { printMessage } = require('./lib/print')
const { executionAsyncId } = require('async_hooks')

const log = ['[asnId][milisecs]'];

function hrtime() {
    const t = process.hrtime()
    return (t[0] * 1000000 + t[1] / 1000) / 1000
}

function pad(num, text) {
    text = text || num
    if (num < 10) return '    ' + text
    if (num < 100) return '   ' + text
    if (num < 1000) return '  ' + text
    if (num < 10000) return ' ' + text
    return text
}

function flush() {
    printMessage('\n' + log.join('\n'))
}
const buggerCall = (msg = '') => {
    if (!t0) {
        t0 = hrtime()
    }
    const dt = hrtime() - t0
    log.push(`[${pad(executionAsyncId())}][${pad(dt, dt.toFixed(2))}] ${getCurrentPosition((Error()).stack, 1)} ${msg} `)

}
let t0;
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
