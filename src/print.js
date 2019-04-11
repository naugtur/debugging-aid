module.exports = {
  printMessage(title, message) {
    process._rawDebug(title, message);
  },
  printMap(title, obj) {
    process._rawDebug(title, 
      Object.keys(obj)
        .map(k => `${k}: ${obj[k]}`)
        .join()
    );
  }
};
