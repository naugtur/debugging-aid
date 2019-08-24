
var request = require('request')
var got = require('got')
var axios = require('axios')
var septa = require('septa')
var bus5 = new septa.BusRoute(5)
bus5.fetchDetours(() => { })

request('http://example.com')
got('http://example.com')
axios('http://example.com')

// console.log(require('module')._cache)
