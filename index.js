'use strict';
let nodeMajor = process.version.match(/([0-9]+)\./)[1];

if (nodeMajor < 4) {
  module.exports = require('./legacy');
} else if (nodeMajor.match(/4/)) {
  require("regenerator-runtime/runtime");
  module.exports = require('./node'+nodeMajor);
} else if (nodeMajor.match(/6|8/)) {
  module.exports = require('./node'+nodeMajor);
} else {
  module.exports = require('./node8');
}
