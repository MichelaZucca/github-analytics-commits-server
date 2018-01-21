const Agent = require('./agent.js');
const Server = require('./server.js');

const port = 9190;
const url = `localhost:${port}`;

const token = require('../credentials.json');

const agent = new Agent('https://api.github.com/graphql', token);
const server = new Server(port, agent, null);

server.start();
