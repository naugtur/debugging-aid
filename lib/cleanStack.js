
const loaders = /\(internal\/modules\//
const consoleInternals = /\(internal\/console\//
const internals = /\(internal\//
const external = /\(\//
const hooks = /\((internal\/)?async_hooks\.js:/ //special case for hooks, earlier versions of node didn't have the internal/ prefix
const anon = /[^(]*\(<anonymous>\).*/
const mitm = /at Mitm\./
module.exports = {

  cleanHooksStackMeta(stack) {
    const wasConsole = consoleInternals.test(stack)
    const frames = stack.split('\n').slice(2)
    let wasAnon = false;
    let lastBeforeExternal = null
    while (internals.test(frames[0]) || hooks.test(frames[0])) {
      frames.shift()
    }

    while (!external.test(frames[0])) {
      lastBeforeExternal = frames.shift()
    }
    if (anon.test(lastBeforeExternal)) {
      wasAnon = lastBeforeExternal
    }
    return {
      frames,
      wasAnon,
      wasConsole
    }
  },
  cleanHooksStack(stack) {
    const frames = stack.split('\n').slice(2)
    while (internals.test(frames[0]) || anon.test(frames[0]) || hooks.test(frames[0])) {
      frames.shift()
    }
    return frames
  },
  cleanLoadStack(stack) {
    const frames = stack.split('\n')
    return frames.filter(frame => !loaders.test(frame)).slice(2)
  },
  cleanMitmStack(stack) {
    const frames = stack.split('\n')
    // this part is opinionated, but it's here to avoid confusing people with internals
    let i = frames.length - 1
    while (i && !mitm.test(frames[i])) {
      i--
    }
    return frames.slice(i + 1, stack.length - 1)
  }

}
