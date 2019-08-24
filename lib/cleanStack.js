
const loaders = /\(internal\/modules\//
const skippable = /\((internal\/)?async_hooks\.js:/
const anon = /.*Promise.*\(<anonymous>\).*/
const mitm = /at Mitm\./
module.exports = {

  cleanHooksStack (stack) {
    const frames = stack.split('\n')
    // this part is opinionated, but it's here to avoid confusing people with internals
    let i = frames.length - 1
    while (i && !skippable.test(frames[i]) && anon.test(frames[i])) {
      i--
    }
    return frames.slice(i + 1, stack.length - 1)
  },
  cleanLoadStack (stack) {
    const frames = stack.split('\n')
    return frames.filter(frame => !loaders.test(frame)).slice(2)
  },
  cleanMitmStack (stack) {
    const frames = stack.split('\n')
    // this part is opinionated, but it's here to avoid confusing people with internals
    let i = frames.length - 1
    while (i && !mitm.test(frames[i])) {
      i--
    }
    return frames.slice(i + 1, stack.length - 1)
  }

}
