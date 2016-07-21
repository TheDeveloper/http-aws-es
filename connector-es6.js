/**
 * A Connection handler for Amazon ES.
 *
 * Uses the aws-sdk to make signed requests to an Amazon ES endpoint.
 * Define the Amazon ES config and the connection handler
 * in the client configuration:
 *
 * var es = require('elasticsearch').Client({
 *  hosts: 'https://amazon-es-host.us-east-1.es.amazonaws.com',
 *  connectionClass: require('http-aws-es'),
 *  amazonES: {
 *    region: 'us-east-1',
 *    accessKey: 'AKID',
 *    secretKey: 'secret',
 *    credentials: new AWS.EnvironmentCredentials('AWS') // Optional
 *  }
 * });
 *
 * @param client {Client} - The Client that this class belongs to
 * @param config {Object} - Configuration options
 * @param [config.protocol=http:] {String} - The HTTP protocol that this connection will use, can be set to https:
 * @class HttpConnector
 */

let AWS = require('aws-sdk');
let HttpConnector = require('elasticsearch/src/lib/connectors/http');
let _ = require('elasticsearch/src/lib/utils');
let zlib = require('zlib');

function getAWSCredentials(creds, cb) {
  function fail(err) {
    return setImmediate(() => cb(err));
  }

  function success(creds) {
    return setImmediate(() => cb(null, creds));
  }

  if (creds) {
    creds.get(err => {
      if (err) return fail(err);
      return success(creds);
    });
    return;
  }

  var chain = new AWS.CredentialProviderChain();

  chain.resolve((err, creds) => {
    if (err) return fail(err);

    return success(creds);
  });
}

class HttpAmazonESConnector extends HttpConnector {
  constructor(host, config) {
    super(host, config);
    this.endpoint = new AWS.Endpoint(host.host);
    let c = config.amazonES || {};

    if (typeof c.credentials === 'object') {
      this.creds = c.credentials;
    } else if (c.accessKey && c.secretKey) {
      this.creds = new AWS.Credentials(c.accessKey, c.secretKey);
    }
    this.amazonES = c;
  }

  request(params, cb) {
    let incoming;
    let request;
    let req;
    let status = 0;
    let headers = {};
    const log = this.log;
    let response;
    let abort = false;

    let reqParams = this.makeReqParams(params);
    // general clean-up procedure to run after the request
    // completes, has an error, or is aborted.
    let cleanUp = _.bind(function (err) {
      req && req.removeAllListeners();
      incoming && incoming.removeAllListeners();

      if ((err instanceof Error) === false) {
        err = void 0;
      }

      log.trace(params.method, reqParams, params.body, response, status);
      if (err) {
        cb(err);
      } else {
        cb(err, response, status, headers);
      }
    }, this);

    let dispatch = creds => {
      if (abort) return cleanUp();
      // Sign the request (Sigv4)
      let signer = new AWS.Signers.V4(request, 'es');
      signer.addAuthorization(creds, new Date());

      let send = new AWS.NodeHttpClient();
      req = send.handleRequest(request, null, function (_incoming) {
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
    };

    request = new AWS.HttpRequest(this.endpoint);

    // copy across params
    for (let p in reqParams) {
      request[p] = reqParams[p];
    }
    request.region = this.amazonES.region;
    if (params.body) request.body = params.body;
    if (!request.headers) request.headers = {};
    request.headers['presigned-expires'] = false;
    request.headers['Host'] = this.endpoint.host;

    getAWSCredentials(this.creds, (err, creds) => {
      if (err) return cleanUp(err);

      dispatch(creds);
    });

    return function () {
      abort = true;
      req && req.abort();
    };
  }
}

module.exports = HttpAmazonESConnector;
