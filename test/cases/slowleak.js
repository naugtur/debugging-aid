const leakyleaky = [];

module.exports = ()=>{

    setInterval(()=>{
        leakyleaky.push("hello, I'm leaking")
        leakyleaky.push({yeah: "me too"})
    },1)
}