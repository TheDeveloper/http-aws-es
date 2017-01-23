var AWS = require('aws-sdk');
var elasticsearch = require('elasticsearch');
var http_aws_es = require('http-aws-es');

var credentials = new AWS.EnvironmentCredentials('AWS');

exports.handler = function(event, context, callback) {
    var esOptions = {
        hosts: event.endpoint,
        connectionClass: http_aws_es,
        amazonES: {
            region: process.env.AWS_DEFAULT_REGION,
            credentials: credentials
        }
    };
    var es = elasticsearch.Client(esOptions);

    es.ping({}, function(error) {
        if (error) {
            callback(error);
        } else {
            callback(null, "success");
        }
    });
};
