const http = require('http')
const https = require('https')
require('request-to-curl')
const { printMessage } = require('./lib/print')
const oldRequest = http.request
http.request = (options, callback) => {
  const re = oldRequest(options, callback)
  re.on('finish', () => printMessage(re.toCurl()))

  return re
}
const oldRequestS = https.request
https.request = (options, callback) => {
  const re = oldRequestS(options, callback)
  re.on('finish', () => printMessage(re.toCurl()))

  return re
}
