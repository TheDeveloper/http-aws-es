'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _awsSdk = require('aws-sdk');

var _awsSdk2 = _interopRequireDefault(_awsSdk);

var _http = require('elasticsearch/src/lib/connectors/http');

var _http2 = _interopRequireDefault(_http);

var _utils = require('elasticsearch/src/lib/utils');

var _utils2 = _interopRequireDefault(_utils);

var _zlib = require('zlib');

var _zlib2 = _interopRequireDefault(_zlib);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

var HttpAmazonESConnector = function (_HttpConnector) {
  (0, _inherits3.default)(HttpAmazonESConnector, _HttpConnector);

  function HttpAmazonESConnector(host, config) {
    (0, _classCallCheck3.default)(this, HttpAmazonESConnector);

    var _this = (0, _possibleConstructorReturn3.default)(this, (HttpAmazonESConnector.__proto__ || Object.getPrototypeOf(HttpAmazonESConnector)).call(this, host, config));

    var protocol = host.protocol,
        port = host.port;

    var endpoint = new _awsSdk2.default.Endpoint(host.host);

    if (protocol) endpoint.protocol = protocol.replace(/:?$/, ":");
    if (port) endpoint.port = port;

    _this.AWS = _awsSdk2.default;
    _this.endpoint = endpoint;
    return _this;
  }

  (0, _createClass3.default)(HttpAmazonESConnector, [{
    key: 'request',
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(params, cb) {
        var incoming, timeoutId, request, req, status, headers, log, response, AWS, reqParams, cleanUp, p, CREDS, signer, send;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                incoming = void 0;
                timeoutId = void 0;
                request = void 0;
                req = void 0;
                status = 0;
                headers = {};
                log = this.log;
                response = void 0;
                AWS = this.AWS;
                reqParams = this.makeReqParams(params);
                // general clean-up procedure to run after the request
                // completes, has an error, or is aborted.

                cleanUp = _utils2.default.bind(function (err) {
                  clearTimeout(timeoutId);

                  req && req.removeAllListeners();
                  incoming && incoming.removeAllListeners();

                  if (err instanceof Error === false) {
                    err = void 0;
                  }

                  log.trace(params.method, reqParams, params.body, response, status);
                  if (err) {
                    cb(err);
                  } else {
                    cb(err, response, status, headers);
                  }
                }, this);


                request = new AWS.HttpRequest(this.endpoint);

                // copy across params
                for (p in reqParams) {
                  request[p] = reqParams[p];
                }
                request.region = AWS.config.region;
                if (params.body) request.body = params.body;
                if (!request.headers) request.headers = {};
                request.headers['presigned-expires'] = false;
                request.headers['Host'] = this.endpoint.host;

                // load creds
                CREDS = void 0;
                _context.prev = 19;
                _context.next = 22;
                return this.getAWSCredentials();

              case 22:
                CREDS = _context.sent;


                // Sign the request (Sigv4)
                signer = new AWS.Signers.V4(request, 'es');

                signer.addAuthorization(CREDS, new Date());
                _context.next = 32;
                break;

              case 27:
                _context.prev = 27;
                _context.t0 = _context['catch'](19);

                if (_context.t0 && _context.t0.message) _context.t0.message = `AWS Credentials error: ${_context.t0.message}`;
                cleanUp(_context.t0);
                return _context.abrupt('return', function () {});

              case 32:
                send = new AWS.NodeHttpClient();

                req = send.handleRequest(request, null, function (_incoming) {
                  incoming = _incoming;
                  status = incoming.statusCode;
                  headers = incoming.headers;
                  response = '';

                  var encoding = (headers['content-encoding'] || '').toLowerCase();
                  if (encoding === 'gzip' || encoding === 'deflate') {
                    incoming = incoming.pipe(_zlib2.default.createUnzip());
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

                return _context.abrupt('return', function () {
                  req.abort();
                });

              case 38:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this, [[19, 27]]);
      }));

      function request(_x, _x2) {
        return _ref.apply(this, arguments);
      }

      return request;
    }()
  }, {
    key: 'getAWSCredentials',
    value: function getAWSCredentials() {
      var AWS = this.AWS;


      return new Promise(function (resolve, reject) {
        AWS.config.getCredentials(function (err, creds) {
          if (err) return reject(err);
          return resolve(creds);
        });
      });
    }
  }]);
  return HttpAmazonESConnector;
}(_http2.default);

module.exports = HttpAmazonESConnector;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2Nvbm5lY3Rvci5qcyJdLCJuYW1lcyI6WyJIdHRwQW1hem9uRVNDb25uZWN0b3IiLCJob3N0IiwiY29uZmlnIiwicHJvdG9jb2wiLCJwb3J0IiwiZW5kcG9pbnQiLCJFbmRwb2ludCIsInJlcGxhY2UiLCJBV1MiLCJwYXJhbXMiLCJjYiIsImluY29taW5nIiwidGltZW91dElkIiwicmVxdWVzdCIsInJlcSIsInN0YXR1cyIsImhlYWRlcnMiLCJsb2ciLCJyZXNwb25zZSIsInJlcVBhcmFtcyIsIm1ha2VSZXFQYXJhbXMiLCJjbGVhblVwIiwiYmluZCIsImVyciIsImNsZWFyVGltZW91dCIsInJlbW92ZUFsbExpc3RlbmVycyIsIkVycm9yIiwidHJhY2UiLCJtZXRob2QiLCJib2R5IiwiSHR0cFJlcXVlc3QiLCJwIiwicmVnaW9uIiwiQ1JFRFMiLCJnZXRBV1NDcmVkZW50aWFscyIsInNpZ25lciIsIlNpZ25lcnMiLCJWNCIsImFkZEF1dGhvcml6YXRpb24iLCJEYXRlIiwibWVzc2FnZSIsInNlbmQiLCJOb2RlSHR0cENsaWVudCIsImhhbmRsZVJlcXVlc3QiLCJfaW5jb21pbmciLCJzdGF0dXNDb2RlIiwiZW5jb2RpbmciLCJ0b0xvd2VyQ2FzZSIsInBpcGUiLCJjcmVhdGVVbnppcCIsInNldEVuY29kaW5nIiwib24iLCJkIiwic2V0Tm9EZWxheSIsInNldFNvY2tldEtlZXBBbGl2ZSIsImFib3J0IiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJnZXRDcmVkZW50aWFscyIsImNyZWRzIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFXQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7O0FBZEE7Ozs7Ozs7Ozs7O0lBZ0JNQSxxQjs7O0FBQ0osaUNBQVlDLElBQVosRUFBa0JDLE1BQWxCLEVBQTBCO0FBQUE7O0FBQUEsNEpBQ2xCRCxJQURrQixFQUNaQyxNQURZOztBQUFBLFFB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QUNELFNBSEQ7QUFJRCxPQUxNLENBQVA7QUFNRDs7Ozs7QUFHSEMsT0FBT0MsT0FBUCxHQUFpQjlELHFCQUFqQiIsImZpbGUiOiJjb25uZWN0b3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEEgY29ubmVjdGlvbiBoYW5kbGVyIGZvciBBbWF6b24gRVMuXG4gKlxuICogVXNlcyB0aGUgYXdzLXNkayB0byBtYWtlIHNpZ25lZCByZXF1ZXN0cyB0byBhbiBBbWF6b24gRVMgZW5kcG9pbnQuXG4gKlxuICogQHBhcmFtIGNsaWVudCB7Q2xpZW50fSAtIFRoZSBDbGllbnQgdGhhdCB0aGlzIGNsYXNzIGJlbG9uZ3MgdG9cbiAqIEBwYXJhbSBjb25maWcge09iamVjdH0gLSBDb25maWd1cmF0aW9uIG9wdGlvbnNcbiAqIEBwYXJhbSBbY29uZmlnLnByb3RvY29sPWh0dHA6XSB7U3RyaW5nfSAtIFRoZSBIVFRQIHByb3RvY29sIHRoYXQgdGhpcyBjb25uZWN0aW9uIHdpbGwgdXNlLCBjYW4gYmUgc2V0IHRvIGh0dHBzOlxuICogQGNsYXNzIEh0dHBDb25uZWN0b3JcbiAqL1xuXG5pbXBvcnQgQVdTIGZyb20gJ2F3cy1zZGsnO1xuaW1wb3J0IEh0dHBDb25uZWN0b3IgZnJvbSAnZWxhc3RpY3NlYXJjaC9zcmMvbGliL2Nvbm5lY3RvcnMvaHR0cCdcbmltcG9ydCBfIGZyb20gJ2VsYXN0aWNzZWFyY2gvc3JjL2xpYi91dGlscyc7XG5pbXBvcnQgemxpYiBmcm9tICd6bGliJztcblxuY2xhc3MgSHR0cEFtYXpvbkVTQ29ubmVjdG9yIGV4dGVuZHMgSHR0cENvbm5lY3RvciB7XG4gIGNvbnN0cnVjdG9yKGhvc3QsIGNvbmZpZykge1xuICAgIHN1cGVyKGhvc3QsIGNvbmZpZyk7XG4gICAgY29uc3QgeyBwcm90b2NvbCwgcG9ydCB9ID0gaG9zdDtcbiAgICBjb25zdCBlbmRwb2ludCA9IG5ldyBBV1MuRW5kcG9pbnQoaG9zdC5ob3N0KTtcblxuICAgIGlmIChwcm90b2NvbCkgZW5kcG9pbnQucHJvdG9jb2wgPSBwcm90b2NvbC5yZXBsYWNlKC86PyQvLCBcIjpcIik7XG4gICAgaWYgKHBvcnQpIGVuZHBvaW50LnBvcnQgPSBwb3J0O1xuXG4gICAgdGhpcy5BV1MgPSBBV1M7XG4gICAgdGhpcy5lbmRwb2ludCA9IGVuZHBvaW50O1xuICB9XG5cbiAgYXN5bmMgcmVxdWVzdChwYXJhbXMsIGNiKSB7XG4gICAgbGV0IGluY29taW5nO1xuICAgIGxldCB0aW1lb3V0SWQ7XG4gICAgbGV0IHJlcXVlc3Q7XG4gICAgbGV0IHJlcTtcbiAgICBsZXQgc3RhdHVzID0gMDtcbiAgICBsZXQgaGVhZGVycyA9IHt9O1xuICAgIGxldCBsb2cgPSB0aGlzLmxvZztcbiAgICBsZXQgcmVzcG9uc2U7XG4gICAgY29uc3QgQVdTID0gdGhpcy5BV1M7XG5cbiAgICBsZXQgcmVxUGFyYW1zID0gdGhpcy5tYWtlUmVxUGFyYW1zKHBhcmFtcyk7XG4gICAgLy8gZ2VuZXJhbCBjbGVhbi11cCBwcm9jZWR1cmUgdG8gcnVuIGFmdGVyIHRoZSByZXF1ZXN0XG4gICAgLy8gY29tcGxldGVzLCBoYXMgYW4gZXJyb3IsIG9yIGlzIGFib3J0ZWQuXG4gICAgbGV0IGNsZWFuVXAgPSBfLmJpbmQoZnVuY3Rpb24gKGVycikge1xuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRJZCk7XG5cbiAgICAgIHJlcSAmJiByZXEucmVtb3ZlQWxsTGlzdGVuZXJzKCk7XG4gICAgICBpbmNvbWluZyAmJiBpbmNvbWluZy5yZW1vdmVBbGxMaXN0ZW5lcnMoKTtcblxuICAgICAgaWYgKChlcnIgaW5zdGFuY2VvZiBFcnJvcikgPT09IGZhbHNlKSB7XG4gICAgICAgIGVyciA9IHZvaWQgMDtcbiAgICAgIH1cblxuICAgICAgbG9nLnRyYWNlKHBhcmFtcy5tZXRob2QsIHJlcVBhcmFtcywgcGFyYW1zLmJvZHksIHJlc3BvbnNlLCBzdGF0dXMpO1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBjYihlcnIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2IoZXJyLCByZXNwb25zZSwgc3RhdHVzLCBoZWFkZXJzKTtcbiAgICAgIH1cbiAgICB9LCB0aGlzKTtcblxuICAgIHJlcXVlc3QgPSBuZXcgQVdTLkh0dHBSZXF1ZXN0KHRoaXMuZW5kcG9pbnQpO1xuXG4gICAgLy8gY29weSBhY3Jvc3MgcGFyYW1zXG4gICAgZm9yIChsZXQgcCBpbiByZXFQYXJhbXMpIHtcbiAgICAgIHJlcXVlc3RbcF0gPSByZXFQYXJhbXNbcF07XG4gICAgfVxuICAgIHJlcXVlc3QucmVnaW9uID0gQVdTLmNvbmZpZy5yZWdpb247XG4gICAgaWYgKHBhcmFtcy5ib2R5KSByZXF1ZXN0LmJvZHkgPSBwYXJhbXMuYm9keTtcbiAgICBpZiAoIXJlcXVlc3QuaGVhZGVycykgcmVxdWVzdC5oZWFkZXJzID0ge307XG4gICAgcmVxdWVzdC5oZWFkZXJzWydwcmVzaWduZWQtZXhwaXJlcyddID0gZmFsc2U7XG4gICAgcmVxdWVzdC5oZWFkZXJzWydIb3N0J10gPSB0aGlzLmVuZHBvaW50Lmhvc3Q7XG5cbiAgICAvLyBsb2FkIGNyZWRzXG4gICAgbGV0IENSRURTO1xuICAgIHRyeSB7XG4gICAgICBDUkVEUyA9IGF3YWl0IHRoaXMuZ2V0QVdTQ3JlZGVudGlhbHMoKTtcblxuICAgICAgLy8gU2lnbiB0aGUgcmVxdWVzdCAoU2lndjQpXG4gICAgICBsZXQgc2lnbmVyID0gbmV3IEFXUy5TaWduZXJzLlY0KHJlcXVlc3QsICdlcycpO1xuICAgICAgc2lnbmVyLmFkZEF1dGhvcml6YXRpb24oQ1JFRFMsIG5ldyBEYXRlKCkpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmIChlICYmIGUubWVzc2FnZSkgZS5tZXNzYWdlID0gYEFXUyBDcmVkZW50aWFscyBlcnJvcjogJHtlLm1lc3NhZ2V9YDtcbiAgICAgIGNsZWFuVXAoZSk7XG4gICAgICByZXR1cm4gKCkgPT4ge307XG4gICAgfVxuXG4gICAgbGV0IHNlbmQgPSBuZXcgQVdTLk5vZGVIdHRwQ2xpZW50KCk7XG4gICAgcmVxID0gc2VuZC5oYW5kbGVSZXF1ZXN0KHJlcXVlc3QsIG51bGwsIGZ1bmN0aW9uIChfaW5jb21pbmcpIHtcbiAgICAgIGluY29taW5nID0gX2luY29taW5nO1xuICAgICAgc3RhdHVzID0gaW5jb21pbmcuc3RhdHVzQ29kZTtcbiAgICAgIGhlYWRlcnMgPSBpbmNvbWluZy5oZWFkZXJzO1xuICAgICAgcmVzcG9uc2UgPSAnJztcblxuICAgICAgbGV0IGVuY29kaW5nID0gKGhlYWRlcnNbJ2NvbnRlbnQtZW5jb2RpbmcnXSB8fCAnJykudG9Mb3dlckNhc2UoKTtcbiAgICAgIGlmIChlbmNvZGluZyA9PT0gJ2d6aXAnIHx8IGVuY29kaW5nID09PSAnZGVmbGF0ZScpIHtcbiAgICAgICAgaW5jb21pbmcgPSBpbmNvbWluZy5waXBlKHpsaWIuY3JlYXRlVW56aXAoKSk7XG4gICAgICB9XG5cbiAgICAgIGluY29taW5nLnNldEVuY29kaW5nKCd1dGY4Jyk7XG4gICAgICBpbmNvbWluZy5vbignZGF0YScsIGZ1bmN0aW9uIChkKSB7XG4gICAgICAgIHJlc3BvbnNlICs9IGQ7XG4gICAgICB9KTtcblxuICAgICAgaW5jb21pbmcub24oJ2Vycm9yJywgY2xlYW5VcCk7XG4gICAgICBpbmNvbWluZy5vbignZW5kJywgY2xlYW5VcCk7XG4gICAgfSwgY2xlYW5VcCk7XG5cbiAgICByZXEub24oJ2Vycm9yJywgY2xlYW5VcCk7XG5cbiAgICByZXEuc2V0Tm9EZWxheSh0cnVlKTtcbiAgICByZXEuc2V0U29ja2V0S2VlcEFsaXZlKHRydWUpO1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgIHJlcS5hYm9ydCgpO1xuICAgIH07XG4gIH1cblxuICBnZXRBV1NDcmVkZW50aWFscygpIHtcbiAgICBjb25zdCB7IEFXUyB9ID0gdGhpcztcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBBV1MuY29uZmlnLmdldENyZWRlbnRpYWxzKChlcnIsIGNyZWRzKSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHJldHVybiByZWplY3QoZXJyKTtcbiAgICAgICAgcmV0dXJuIHJlc29sdmUoY3JlZHMpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBIdHRwQW1hem9uRVNDb25uZWN0b3I7XG4iXX0=
