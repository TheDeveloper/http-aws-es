const path = require('path');
const express = require('express');
const app = express();
let server;

app.use(express.static(path.join(__dirname, 'public')));

exports.app = app;
exports.start = function(cb) {
  server = app.listen(8000, cb);
}
exports.stop = function(cb) {
  server.once('close', cb);
  server.close();
}
