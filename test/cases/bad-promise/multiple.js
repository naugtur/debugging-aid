// multiple resolves
const work = (input)=> new Promise((resolve, reject) => {
  switch(input){
    case 1:
    resolve('ok')
    case 2: 
    resolve('not again')
    default:
    setTimeout(() => {
      resolve('later')
    }, 1000);
  }
});

work(1).then(console.log, console.error);

