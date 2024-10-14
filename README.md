# Lizard

<img src="https://github.com/user-attachments/assets/11fb46c4-b702-4ec6-8b12-14f2d6a144e1" alt="The Lizard Card Game" width=320 />
</br></br>

A fun card game to play with friends (or foes). Work in progress.


- Chek [RULES](RULES.md) for more information how the game is played.
- Chek [BACKLOG](BACKLOG.md) for current development status and roadmap.


## Development

Requires Node.js v22 or greater. I'm using [Volta](https://volta.sh) to automatically switch Node.js versions between projects.

Install dependencies with `npm install` and you are ready to go.


### Project Structure

- apps
  - cli
  - server
  - client
- packages
  - game
  - util


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
  - Client Side
     - No React :)
     - Revisiting Modern "Vanilla" CSS. What's possible?
     - View Transitions API
- Architecture
  - Clear seperation of concerns: Isolated game core logic that allows for multiple implementations of the game
  - Service logic decouploed from protocol layer (HTTP/SSH/Telnet etc.) & API layer (REST, GraphQL, RPC etc.)
- Deployment
  - Deploy "anywhere": Edge/Serverless/Docker?


### Code conventions

Tools used to enfore code formatting:

- [Editorconfig](https://editorconfig.org)
- [Prettier](https://prettier.io)
