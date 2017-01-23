# Connection handler for Amazon ES [<img title="Version" src="https://img.shields.io/npm/v/http-aws-es.svg?style=flat-square" />](https://www.npmjs.org/package/http-aws-es)
Makes elasticsearch-js compatible with Amazon ES. It uses the aws-sdk to make signed requests to an Amazon ES endpoint.

## Installation
```bash
npm install --save http-aws-es
```

## Usage
Define the Amazon ES config and the connection handler in the client configuration:
```javascript
var es = require('elasticsearch').Client({
  hosts: 'https://amazon-es-host.us-east-1.es.amazonaws.com',
  connectionClass: require('http-aws-es'),
  amazonES: {
    region: 'us-east-1',
    accessKey: 'AKID',
    secretKey: 'secret'
  }
});
```


Pre-configured credentials can be fetched automatically (through AWS's `getCredentials` function) by specifying `getCredentials: true` in the `amazonES` object in place of `accessKey` and `secretKey`.

Alternatively you can pass in your own [AWS Credentials object](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Credentials.html).
This is particularly useful if running on AWS Lambda, since the appropriate credentials are already in the environment.

```javascript
var AWS = require('aws-sdk');
var myCredentials = new AWS.EnvironmentCredentials('AWS'); // Lambda provided credentials
var es = require('elasticsearch').Client({
  hosts: 'https://amazon-es-host.us-east-1.es.amazonaws.com',
  connectionClass: require('http-aws-es'),
  amazonES: {
    region: "us-east-1",
    credentials: myCredentials
  }
});
```
