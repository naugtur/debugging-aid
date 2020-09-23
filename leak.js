'use strict'
const { PerformanceObserver } = require('perf_hooks')
const v8 = require('v8')
const { printMessage } = require('./lib/print')

function saveHistory (length, evaluate) {
  const data = {}

  return {
    add (key, value) {
      if (!data[key]) {
        data[key] = []
      }
      data[key].push(value)
      if (data[key].length > length) {
        data[key].shift()
        evaluate(data)
      }
    }
  }
}

const HISTORY_LENGHT = 5
const heapHistory = saveHistory(HISTORY_LENGHT, (data) => {
  Object.entries(data).forEach(([key, history]) => {
    let prev = 0
    let isGrowing = true
    history.some((size) => {
      if (size <= prev) {
        isGrowing = false
        prev = size
        return true
      }
      prev = size
    })
    if (isGrowing) {
      printMessage(`Heap '${key}' was growing for ${HISTORY_LENGHT} consecutive GCs, ${history}`)
    }
  })
})
const obs = new PerformanceObserver((list) => {
  if (list.getEntries().length > 0) {
    const stats = v8.getHeapSpaceStatistics()

    stats.forEach((stat) => {
      heapHistory.add(stat.space_name, stat.space_used_size)
    })
  }
})
obs.observe({ entryTypes: ['gc'], buffered: false })
