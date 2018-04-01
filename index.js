require = require("esm")(module/*, options*/);
console.time('mostly-env import');
module.exports = require('./src/env');
console.timeEnd('mostly-env import');
