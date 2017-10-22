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

describe('ES', function() {
  this.timeout(10000);
  this.slow(1000);

  it('should be able to connect', done => {
    client.cluster.health(function (err, res) {
      if (err) {
        done(err);
        return;
      }
      
      console.log(res);
      
      done();
    });
  });

  it('can clearScroll()', () => {
    let params = {
      scroll: '10s',
      size: 0
    };

    return client.search(params)
    .then(result => {
      params = {
        scrollId: [ result._scroll_id ]
      };
      return client.clearScroll(params);
    });
  });

  it('handles unicode', () => {
    let params = {
      index: '*',
      size: 0,
      body: {
        query: { query_string: { query: "ü" } }
      }
    };
    return client.search(params);
  });
});
