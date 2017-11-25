'use strict';

const EventEmitter = require('events').EventEmitter;

const AWS = require('aws-sdk');
const expect = require('chai').expect;
const Host = require('elasticsearch/src/lib/host');
const sinon = require('sinon');

const Connector = require('../connector')

describe('constructor', function() {

  it('throws when no host is provided', function () {
    expect(() => new Connector()).to.throw();
  });

  it('assigns httpOptions', function() {
    const httpOptions = { foo: 'bar' };
    const host = new Host();
    const connector = new Connector(host, { httpOptions });

    expect(connector.httpOptions).to.deep.equal(httpOptions);
  });

});

describe('request', function () {

  beforeEach(function() {
    AWS.config.update({
      region: 'us-east-1'
    });

    const host = new Host();
    const connector = new Connector(host, {});

    sinon.stub(connector, 'getAWSCredentials').resolves({
      secretAccessKey: 'abc',
      accessKeyId: 'abc'
    });

    this.signRequest = sinon.stub(connector, 'signRequest');

    this.connector = connector;
  });

  it('returns a cancel function that aborts the request', function (done) {
    const fakeReq = new EventEmitter();

    fakeReq.setNoDelay = sinon.stub();
    fakeReq.setSocketKeepAlive = sinon.stub();
    fakeReq.abort = sinon.stub();

    sinon.stub(this.connector.httpClient, 'handleRequest').returns(fakeReq);

    const cancel = this.connector.request({}, () => {});

    // since getCredentials is async, we have to let the event loop tick
    setTimeout(() => {
      try {
        expect(cancel).to.be.a('function');

        cancel();

        expect(fakeReq.abort.called).to.be.true;

        done();
      } catch (e) {
        done(e);
      }
    });
  });

  it('calls callback with error', function (done) {
    const error = new Error();

    const fakeReq = new EventEmitter();

    fakeReq.setNoDelay = sinon.stub();
    fakeReq.setSocketKeepAlive = sinon.stub();

    sinon.stub(this.connector.httpClient, 'handleRequest')
      .callsFake(function(request, options, callback) {
        callback(error);
        return fakeReq;
      });

    this.connector.request({}, function (err) {
      try {
        expect(err).to.deep.equal(error);
        done();
      } catch (e) {
        done(e);
      }
    });
  });

});
