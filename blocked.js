const { printMap } = require('./lib/print')

require('blocked-at')((time, stack) => {
  printMap('blocked', { time, stack })
}, { trimFalsePositives: true })
