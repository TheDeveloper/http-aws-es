# Connection handler for Amazon ES [<img title="Version" src="https://img.shields.io/npm/v/http-aws-es.svg?style=flat-square" />](https://www.npmjs.org/package/http-aws-es)
Makes elasticsearch-js compatible with Amazon ES. It uses the aws-sdk to make signed requests to an Amazon ES endpoint.

## Installation
```bash
# Install the connector, elasticsearch client and aws-sdk
npm install --save http-aws-es aws-sdk elasticsearch
```

## Usage
```javascript
// configure the region for aws-sdk
let AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });

// create an elasticsearch client for your Amazon ES
var es = require('elasticsearch').Client({
  hosts: [ 'https://amazon-es-host.us-east-1.es.amazonaws.com:80' ],
  connectionClass: require('http-aws-es')
});
```

## Credentials
The connector uses aws-sdk's default credential behaviour to obtain credentials from your environment. If you would like to set credentials manually, you can set them on aws-sdk:

```javascript
AWS.config.update({
  credentials: new AWS.Credentials(accessKeyId, secretAccessKey)
});
```

## Test
```bash
npm run test -- --endpoint https://amazon-es-host.us-east-1.es.amazonaws.com --region us-east-1
```
