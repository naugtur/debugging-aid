// node --trace-event-categories v8,node.perf manual.js

require('../hooks')

require('./cases/promise')()
