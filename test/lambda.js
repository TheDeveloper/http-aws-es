var elasticsearch = require('elasticsearch');
var http_aws_es = require('http-aws-es');

exports.handler = function(event, context, callback) {
    var esOptions = {
        hosts: event.endpoint,
        connectionClass: http_aws_es,
        amazonES: {
            region: process.env.AWS_DEFAULT_REGION
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
