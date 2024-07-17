# Lizard Card Game

![297210933-39a139a0-e22a-40ab-8f38-134fa03cc50c](https://github.com/user-attachments/assets/11fb46c4-b702-4ec6-8b12-14f2d6a144e1)


A fun card game to play with friends (and foes). Work in progres.


- Chek [RULES](RULES.md) for more information how the game is played.
- Chek [BACKLOG](BACKLOG.md) for current development status and roadmap.


## Development

Requires Node.js v22 or greater. I'm using [Volta](https://volta.sh) to automatically switch Node.js versions between projects.

Install dependencies with `npm install` and you are ready to go.

### Play

To play the game via the CLI run:

`npm run play`


### Run Tests

Run tests in watch mode during development:

`npm test`


Single test run with code coverage:

`npm run test:coverage`


### Development philosophy and tech choices

This is a personal hobby project and I've been wanting to explore the following ideas:

- How good can the DX with modern JavaScript and JSDoc be (compared to eg. TypeScript)
- Use as few dependencies as possible
  - Using ESM natively without any transpilation or bundling
  - Use built-in Node.js [test runner](https://nodejs.org/api/test.html)


### Code conventions

Tools used to enfore code formatting:

- [Editorconfig](https://editorconfig.org)
- [Prettier](https://prettier.io)
