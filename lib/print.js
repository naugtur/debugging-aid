const prefix = '[aid] '
module.exports = {
  printMessage (message) {
    process._rawDebug(prefix, message)
  },
  printMap (title, obj) {
    process._rawDebug(prefix + title,
      Object.keys(obj)
        .map(k => ` ${k}: ${obj[k]}`)
        .join('\n')
    )
  }
}
