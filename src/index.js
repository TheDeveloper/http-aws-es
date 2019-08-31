const { Connection } = require('@elastic/elasticsearch');
const aws4 = require('aws4');
const AWS = require('aws-sdk');

class AmazonConnection extends Connection {
  constructor (options) {
    super(options);
    this.awsConfig = options.awsConfig || AWS.config;
  }

  get credentials () {
    return {
      accessKeyId: this.awsConfig.credentials.accessKeyId || process.env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY,
      secretAccessKey: this.awsConfig.credentials.secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_KEY,
      sessionToken: this.awsConfig.credentials.sessionToken || process.env.AWS_SESSION_TOKEN
    };
  }

  buildRequestObject (params) {
    const req = super.buildRequestObject(params);

    if (!req.headers) {
      req.headers = {};
    }

    // Fix the Host header, since HttpConnector.makeReqParams() appends
    // the port number which will cause signature verification to fail
    req.headers['Host'] = req.hostname;

    if (params.body) {
      req.headers['Content-Length'] = Buffer.byteLength(params.body, 'utf8');
      req.body = params.body;
    } else {
      req.headers['Content-Length'] = 0;
    }

    return aws4.sign(req, this.credentials);
  }
}

module.exports = AmazonConnection;
