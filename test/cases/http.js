'use strict'
const slow = require('./helper.slowfunc')
const http = require('http')

module.exports = function start () {
  const server = http.createServer(function (req, res) {
    slow()
    res.end('hello world')
  })

  server.listen(0, 'localhost', function () {
    const addr = server.address()
    http.get(`http://${addr.address}:${addr.port}/something?attr=value`, function (res) {
      res.resume()
      res.once('end', server.close.bind(server))
    })
  })
}
