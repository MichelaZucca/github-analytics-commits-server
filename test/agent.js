const should = require('./chai-config.js');
const Agent = require('../src/agent.js');

const token = require('../credentials.json');


describe('Agent description', (done) => {
  it('Data have infos and results', () => {
    const agent = new Agent('https://api.github.com/graphql', token);

    agent.getAllData('google', 'WebFundamentals', 100)
      .then((data) => {
        should.exist(data);
        console.log(JSON.stringify(data, null, 2));
        done();
      }).catch((err) => {
        should.not.exist(err);
      });
  });
});

