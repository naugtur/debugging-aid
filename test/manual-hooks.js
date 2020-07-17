// AID_HOOK_SCOPE='test/cases/promise' node --trace-event-categories node.perf test/manual-hooks.js

require('../hooks')
require('../promisecount')

require('./cases/promise')()
