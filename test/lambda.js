var AWS = require('aws-sdk');
var credentials = new AWS.EnvironmentCredentials('AWS');

exports.handler = function(event, context, callback) {
    var esOptions = {
        hosts: event.endpoint,
        connectionClass: require('http-aws-es'),
        amazonES: {
            region: process.env.AWS_DEFAULT_REGION,
            credentials: credentials
        }
    };
    var es = require('elasticsearch').Client(esOptions);

    es.ping({}, function(error) {
        if (error) {
            callback(error);
        } else {
            callback(null, "success");
        }
    });
};
