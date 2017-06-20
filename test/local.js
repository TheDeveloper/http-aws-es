var argv = require('minimist')(process.argv.slice(2));

import AWS from 'aws-sdk';
AWS.config.update({ region: argv.region });

const hosts = [ argv.endpoint ];

var esOptions = {
  hosts,
  connectionClass: require('../connector'),
  log: 'trace'
};

var es = require('elasticsearch').Client(esOptions);
async function start() {
  let result = await es.cluster.health();
  console.log(result);
  process.exit();
}

start();

