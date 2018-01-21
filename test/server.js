const should = require('./chai-config.js');
const Agent = require('../src/agent.js');
const Server = require('../src/server.js');

const token = require('../credentials.json');

const port = 9190;
const url = `localhost:${port}`;


describe('Server description', (done) => {
  it('Agent return data', () => {
    const agent = new Agent('https://api.github.com/graphql', token);
    const server = new Server(port, agent, null);

    server.start();

    it('should not return any errors', (done) => {
      should.exist(agent);
      should.exist(server);
      done();
    });
  });
});
