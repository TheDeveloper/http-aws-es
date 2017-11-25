const elasticsearch = require('elasticsearch');
const AWS = require('aws-sdk');

function init(config) {
  const awsConfig = new AWS.Config({
    region: config.AWS_REGION,
    accessKeyId: config.AWS_ACCESS_KEY_ID,
    secretAccessKey: config.AWS_SECRET_ACCESS_KEY
  });

  const es = new elasticsearch.Client({
    host: [ config.AWS_ES_HOST ],
    connectionClass: require('../../connector'),
    awsConfig: awsConfig,
    log: 'trace'
  });

  return es;
}

window.init = init;
