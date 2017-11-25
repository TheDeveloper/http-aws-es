const browserify = require('browserify');
const fs = require('fs');
const path = require('path');

module.exports = function(cb) {
  let opts = {
    paths: path.resolve(__dirname+'/../../')
  };
  console.log(opts);
  let b = browserify(opts);
  b.add(path.join(__dirname, 'app.js'));
  let out = fs.createWriteStream(path.join(__dirname, 'public/app.js'));
  b.bundle().pipe(out);
  out.on('finish', cb);
}
