// node --trace-event-categories v8,node.perf manual.js

require('../network')

require('./cases/http')()
