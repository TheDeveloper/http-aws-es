'use strict';

const AWS = require('aws-sdk');
const elasticsearch = require('elasticsearch');
const argv = require('minimist')(process.argv.slice(2));

AWS.config.update({
  region: argv.region,
  profile: argv.profile
});

const esOptions = {
  hosts: [ argv.endpoint ],
  connectionClass: require('../src'),
  awsConfig: {
    credentials: {
      accessKeyId: AWS.config.credentials.accessKeyId,
      secretAccessKey: AWS.config.credentials.secretAccessKey
    }
  },
  log: 'trace'
};

const client = elasticsearch.Client(esOptions);

describe('AWS Elasticsearch', function () {
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
      scroll: '10s'
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
        query: { query_string: { query: 'ü' } }
      }
    };
    return client.search(params);
  });
});
