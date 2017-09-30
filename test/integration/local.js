'use strict';

const argv = require('minimist')(process.argv.slice(2));
const AWS = require('aws-sdk');
const es = require('elasticsearch')

AWS.config.update({ region: argv.region, profile: argv.profile });

const esOptions = {
  hosts: [ argv.endpoint ],
  connectionClass: require('../..'),
  log: 'trace'
};

const client = es.Client(esOptions);

it('should be able to connect', function (done) {
  this.timeout(10000);
  this.slow(1000);

  client.cluster.health(function (err, res) {
    if (err) {
      done(err);
      return;
    }

    console.log(res);

    done();
  });
});
