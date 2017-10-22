# Connection handler for Amazon ES [<img title="Version" src="https://img.shields.io/npm/v/http-aws-es.svg?style=flat-square" />](https://www.npmjs.org/package/http-aws-es)
Makes [elasticsearch-js](https://github.com/elastic/elasticsearch-js) compatible with Amazon ES. It uses the aws-sdk to make signed requests to an Amazon ES endpoint.

## Installation
```bash
# Install the connector, elasticsearch client and aws-sdk
npm install --save http-aws-es aws-sdk elasticsearch
```

## Usage
```javascript
// create an elasticsearch client for your Amazon ES
let es = require('elasticsearch').Client({
  hosts: [ 'https://amazon-es-host.us-east-1.es.amazonaws.com' ],
  connectionClass: require('http-aws-es')
});
```

## Region + Credentials
The connector uses aws-sdk's default behaviour to obtain region + credentials from your environment. If you would like to set these manually, you can set them on aws-sdk:

```javascript
let AWS = require('aws-sdk');
AWS.config.update({
  credentials: new AWS.Credentials(accessKeyId, secretAccessKey),
  region: 'us-east-1'
});
```

## Options
```javascript
let options = {
  hosts: [], // array of amazon es hosts (required)
  connectionClass: require('http-aws-es'), // use this connector (required)
  awsConfig: new AWS.Config({ region }), // set an aws config e.g. for multiple clients to different regions
  httpOptions: {} // set httpOptions on aws-sdk's request. default to aws-sdk's config.httpOptions
};
let es = require('elasticsearch').Client(options);
```

## Test
```bash
npm test
# test against a real endpoint
AWS_PROFILE=your-profile npm run integration-test -- --endpoint https://amazon-es-host.us-east-1.es.amazonaws.com --region us-east-1
```
