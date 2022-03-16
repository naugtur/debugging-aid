
const loaders = /\(internal\/modules\//
const consoleInternals = /\(internal\/console\//
const internals = /\(internal\//
const external = /\(\//
const hooks = /\((internal\/)?async_hooks\.js:/ // special case for hooks, earlier versions of node didn't have the internal/ prefix
const anon = /[^(]*\(<anonymous>\).*/
const mitm = /at Mitm\./
module.exports = {
  getFrames(stack, depthAdd=0) {
    return stack.split('\n').slice(2+depthAdd)
  },
  getCurrentPosition (stack, depthAdd=0) {
    const cwd = process.cwd();
    const frames = stack.split('\n').slice(2+depthAdd)
    return frames[0].replace(/^\W+at /,'').replace('file://','').replace(cwd,'.')
  },
  cleanHooksStackMeta (stack) {
    const wasConsole = consoleInternals.test(stack)
    const frames = stack.split('\n').slice(2)
    let wasAnon = false; let untraceable = false
    let lastBeforeExternal = null
    while (frames.length && (internals.test(frames[0]) || hooks.test(frames[0]))) {
      frames.shift()
    }

    while (frames.length && !external.test(frames[0])) {
      lastBeforeExternal = frames.shift()
    }
    if (anon.test(lastBeforeExternal)) {
      wasAnon = lastBeforeExternal
    }
    if (frames.length === 0) {
      untraceable = true
    }
    return {
      frames,
      untraceable,
      wasAnon,
      wasConsole
    }
  },
  cleanHooksStack (stack) {
    const frames = stack.split('\n').slice(2)
    while (internals.test(frames[0]) || anon.test(frames[0]) || hooks.test(frames[0])) {
      frames.shift()
    }
    return frames
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
