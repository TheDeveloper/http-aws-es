'use strict';

/**
 * A connection handler for Amazon ES.
 *
 * Uses the aws-sdk to make signed requests to an Amazon ES endpoint.
 *
 * @param client {Client} - The Client that this class belongs to
 * @param config {Object} - Configuration options
 * @param [config.protocol=http:] {String} - The HTTP protocol that this connection will use, can be set to https:
 * @class HttpConnector
 */

const AWS = require('aws-sdk');
const HttpConnector = require('elasticsearch/src/lib/connectors/http');
const zlib = require('zlib');

class HttpAmazonESConnector extends HttpConnector {
  constructor(host, config) {
    super(host, config);

    const protocol = host.protocol;
    const port = host.port;
    const endpoint = new AWS.Endpoint(host.host);

    if (protocol) endpoint.protocol = protocol.replace(/:?$/, ":");
    if (port) endpoint.port = port;

    this.awsConfig = config.awsConfig || AWS.config;
    this.endpoint = endpoint;
    this.httpOptions = config.httpOptions || this.awsConfig.httpOptions;
    this.httpClient = new AWS.NodeHttpClient();
  }

  request(params, cb) {
    const reqParams = this.makeReqParams(params);
    const request = this.createRequest(params, reqParams);
    const signer = new AWS.Signers.V4(request, 'es');

    let req;
    let status = 0;
    let headers = {};
    let response;
    let incoming;

    // general clean-up procedure to run after the request
    // completes, has an error, or is aborted.
    const cleanUp = (err) => {
      req && req.removeAllListeners();
      incoming && incoming.removeAllListeners();

      this.log.trace(params.method, reqParams, params.body, response, status);
      if (err instanceof Error) {
        cb(err);
      } else {
        cb(null, response, status, headers);
      }
    };

    // load creds
    return this.getAWSCredentials()
      .then(creds => {
        // Sign the request (Sigv4)
        signer.addAuthorization(creds, new Date());

        req = this.httpClient.handleRequest(request, this.httpOptions, function (_incoming) {
          incoming = _incoming;
          status = incoming.statusCode;
          headers = incoming.headers;
          response = '';

          let encoding = (headers['content-encoding'] || '').toLowerCase();
          if (encoding === 'gzip' || encoding === 'deflate') {
            incoming = incoming.pipe(zlib.createUnzip());
          }

          incoming.setEncoding('utf8');
          incoming.on('data', function (d) {
            response += d;
          });

          incoming.on('error', cleanUp);
          incoming.on('end', cleanUp);
        }, cleanUp);

        req.on('error', cleanUp);

        req.setNoDelay(true);
        req.setSocketKeepAlive(true);
      })
      .then(() => {
        return () => req.abort();
      })
      .catch(e => {
        if (e && e.message) e.message = `AWS Credentials error: ${e.message}`;
        cleanUp(e);
        return () => {};
      });
  }

  getAWSCredentials() {
    return new Promise((resolve, reject) => {
      this.awsConfig.getCredentials((err, creds) => {
        if (err) return reject(err);
        return resolve(creds);
      });
    });
  }

  createRequest(params, reqParams) {
    const request = new AWS.HttpRequest(this.endpoint);

    // copy across params
    Object.assign(request, reqParams);

    request.region = this.awsConfig.region;
    if (params.body) request.body = params.body;
    if (!request.headers) request.headers = {};
    request.headers['presigned-expires'] = false;
    request.headers['Host'] = this.endpoint.host;

    return request;
  }
}

module.exports = HttpAmazonESConnector;
