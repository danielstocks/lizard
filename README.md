# Lizard

<img src="https://github.com/user-attachments/assets/11fb46c4-b702-4ec6-8b12-14f2d6a144e1" alt="The Lizard Card Game" width=320 />
</br></br>

A fun card game to play with friends (or foes). Work in progress.


- Chek [RULES](RULES.md) for more information how the game is played.
- Chek [BACKLOG](BACKLOG.md) for current development status and roadmap.


## Development

Requires Node.js v22 or greater. I'm personally using [Volta](https://volta.sh) to automatically switch Node.js versions between projects.

Install project dependencies (very few) with `npm install` and you are ready to go.


### Project Structure

- apps
  - cli - Tiny impmentation of game playable through a CLI
  - server - A stateless implementation playable over HTTP
  - client - A web browser UI implementation that uses server as back-end
- packages
  - game - Core game logic, usable both on client/server.
  - util - Utility functions like shuffle()

### Run game

The easiest way to test the game is to run `npm run cli` to run the CLI implenntation of the game. 

To run the game in a web browser you'll need to `npm run sever` and `npm run client` and open open up `http://localhost:5173/` in your favorite web browser


### Run Tests

Run tests in watch mode during development:

`npm test:dev`


Do a single test run with code coverage:

`npm run test:coverage`


### Development philosophy and tech choices

This is a personal hobby project and I've been wanting to explore the following concepts and ideas:

- How good can the DX with modern JavaScript and JSDoc be (compared to eg. TypeScript)
- Use as few dependencies as possible
  - Server Side/Node.js
    - Using ESM natively without any transpilation or bundling.
    - Use built-in Node.js [test runner](https://nodejs.org/api/test.html).
    - Use built-in Node.js [SQLite library](https://nodejs.org/api/sqlite.html).
    - Use built-in WebSockets and/or Server Push Events
    - Use built-in watch mode eg. ´node --watch` instead of eg. Nodemon
  - Client Side/Browser
     - Use Native Browser APIs
     - No JavaScript build step
     - No CSS build step 
- Architecture
  - Clear seperation of concerns: Isolated game core logic that allows for multiple implementations of the game
  - Service logic decouploed from protocol layer (HTTP/SSH/Telnet etc.) & API layer (REST, GraphQL, RPC etc.)
- Deployment
  - Deploy "anywhere": Edge/Serverless/Docker?


### Code style conventions

Tools used to enfore code formatting (and one of the few project dev dependencies):

- [Editorconfig](https://editorconfig.org)
- [Prettier](https://prettier.io)
