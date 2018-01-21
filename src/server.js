const cors = require('cors');

const app = require('express')().use(cors());
const http = require('http').Server(app);
const io = require('socket.io')(http);

/*
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server); */

class Server {
  constructor(port, agent, database) {
    this.port = port;

    app.get('/', (req, res) => {
      res.sendFile(`${__dirname}/index.html`);
    });

    io.on('connection', (socket) => {
      console.log('connection etablished');
      socket.emit('connection etablished');

      socket.on('getAllData', (filters) => {
        const {
          owner,
          name,
          numberFetch,
        } = filters;

        console.log('Demande de data');

        agent.getAllData(owner, name, numberFetch, socket)
          .then((res) => {
          //  socket.emit('getAllData', res);
            return new Promise((resolve) => {
              resolve(res);
            });
          })
          .catch((err) => {
            socket.emit('getAllData', { error: err });
          });
      });
    });
  }
  
  // Start the server
  start() {
    http.listen(this.port, () => {
      console.log(`Listening on ${this.port}`);
    });
  }
}

module.exports = Server;
