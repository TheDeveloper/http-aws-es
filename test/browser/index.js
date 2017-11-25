const server = require('./server');
const browserify = require('./browserify');
const puppeteer = require('puppeteer');

describe('browser', function() {
  this.timeout(10000);

  before(done => browserify(done));
  before(done => server.start(done));

  it('works', done => {
    let browser;
    puppeteer.launch()
    .then(_browser => {
      browser = _browser;
      return browser.newPage()
    })
    .then(page => {
      page.goto('http://localhost:8000');
      page.on('console', msg => {
        for (let i = 0; i < msg.args.length; ++i)
          console.log(`${i}: ${msg.args[i]}`);
      });
      page.exposeFunction('getConfig', () => {
        const env = process.env;
        return {
          AWS_REGION: env.AWS_REGION,
          AWS_ACCESS_KEY_ID: env.AWS_ACCESS_KEY_ID,
          AWS_SECRET_ACCESS_KEY: env.AWS_SECRET_ACCESS_KEY,
          AWS_ES_HOST: env.AWS_ES_HOST
        };
      });
      page.on('load', () => {
        page.evaluate(async () => {
          let config = await window.getConfig();
          const es = window.init(config);
          return es.cluster.health();
        })
        .then(result => {
          console.log(result);
        })
        .then(() => browser.close())
        .then(() => done())
        .catch(done);
      });
    })
  });

  after(done => server.stop(done));
})
