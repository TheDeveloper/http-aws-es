Connection handler for Amazon ES
---

Makes elasticsearch-js compatible with Amazon ES. It uses the aws-sdk to make signed requests to an Amazon ES endpoint.
Define the Amazon ES config and the connection handler
in the client configuration:

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
