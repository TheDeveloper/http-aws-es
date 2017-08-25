var argv = require('minimist')(process.argv.slice(2));

var AWS = require('aws-sdk');
AWS.config.update({ region: argv.region });

var hosts = [ argv.endpoint ];

var esOptions = {
  hosts: hosts,
  connectionClass: require('..'),
  log: 'trace'
};

var es = require('elasticsearch').Client(esOptions);
function start() {
  function cb(err, result) {
    console.log(err, result);
    process.exit();
  }

  es.cluster.health(cb);
}

start();

