const { printMap } = require('./print')

require('blocked-at')((time, stack) => {
  printMap(`blocked`, { time, stack })
}, { trimFalsePositives: true })
