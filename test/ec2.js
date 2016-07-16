var argv = require('minimist')(process.argv.slice(2));
var endpoint = argv.endpoint;
var region = argv.region;

var AWS = require('aws-sdk');
var credentials = new AWS.EC2MetadataCredentials();
var esOptions = {
    hosts: endpoint,
    connectionClass: require('http-aws-es'),
    amazonES: {
        region: region,
        credentials: credentials 
    }
};
var es = require('elasticsearch').Client(esOptions);

es.ping({}, function(error) {
    if (error) {
        console.log("Error communicating with AWS Elasticsearch domain:");
        console.log(error);
    } else {
        console.log("Successfully authenticated to the AWS Elasticsearch domain");
    }
});
