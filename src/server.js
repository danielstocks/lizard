const Server = require('boardgame.io/server').Server;
const Lizard = require('./lizard/game').Game;
const server = Server({ games: [Lizard] });
server.run(8000);