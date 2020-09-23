const leakyleaky = []

module.exports = () => {
  setInterval(() => {
    // eslint-disable-next-line
    const somethingToGarbageCollect = {
      someWeight: 'This object will get garbage collected, so the more we create, the sooner GC runs, which means less waiting for the leak detection.',
      [Math.random().toFixed(5)]: "Let's make it a different object shape every time"
    }
    leakyleaky.push("hello, I'm leaking")
    leakyleaky.push({ yeah: 'me too' })
  }, 0)
}
