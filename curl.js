const http = require('http')
require('request-to-curl')
const { printMessage } = require('./lib/print')
const oldRequest = http.request
http.request = (options, callback) => {
  const re = oldRequest(options, callback)
  re.on('finish', () => printMessage(re.toCurl()))

  return re
}
