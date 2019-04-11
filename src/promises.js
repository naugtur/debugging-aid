const { printMessage } = require("./print");
process.on("multipleResolves", (type, promise, reason) => {
    printMap('multipleResolves', {type, promise, reason});
});


const unhandledRejections = new Map();

process.on('unhandledRejection', (reason, promise) => {
    unhandledRejections.set(promise, reason);
    printMap('unhandledRejection', {promise, reason});
  });
process.on('rejectionHandled', (promise) => {
    unhandledRejections.delete(promise);
    printMap('rejectionHandled (oreviously reported unhandled, handled with a delay)', {promise, reason});
  });