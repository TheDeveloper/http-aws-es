Connection handler for Amazon ES
---

Makes elasticsearch-js compatible with Amazon ES. It uses the aws-sdk to make signed requests to an Amazon ES endpoint.
Define the Amazon ES config and the connection handler in the client configuration.

Configure the AWS Config according to aws-sdk,
which allows using environment variables: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_REGION.

```javascript
AWS.config.update({
  region: 'us-east-1', accessKeyId: 'AKID', secretAccessKey: 'secret'
});

var es = require('elasticsearch').Client({
  hosts: 'https://amazon-es-host.us-east-1.es.amazonaws.com',
  connectionClass: require('http-aws-es'),
  amazonES: AWS.config
});
```
