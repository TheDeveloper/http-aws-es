const AWS = require('aws-sdk');

class XHRClient {
  constructor() {
    this.client = new AWS.XHRClient();    
  }

  handleRequest(request, httpOptions, cb) {
    let xhr, response, body, status, headers;
    delete request.headers['presigned-expires'];

    const done = err => {
      if (err instanceof Error) return cb(err);

      cb(null, body, status, headers);
    }

    this.client.handleRequest(request, httpOptions, res => {
      response = res;
      body = '';

      response.on('headers', (statusCode, _headers) => {
        status = statusCode;
        headers = _headers;
      });

      response.on('data', data => {
        body += data;
      });

      response.on('end', done);
    }, done);

    xhr = request.stream;
    return xhr;
  }
}

module.exports = XHRClient;
