import { describe, test, before } from "node:test";
import assert from "node:assert";
import { createGame, startGame, gameMemoryStore } from "./server.js";

/*
describe("create new game", () => {
  let game;

  before(() => {
    game = createGame("daniel");
  });

  test("creates a new game with gameId", () => {
    let { gameId } = game;
    assert.strictEqual(gameId, gameMemoryStore[gameId].id);
  });

  test("creates a new game with creatorPlayerId", () => {
    let { gameId, playerId } = game;
    assert.strictEqual(playerId, gameMemoryStore[gameId].creatorPlayerId);
  });

  test("player is participating", () => {
    let { playerId, gameId } = game;
    assert.strictEqual(playerId, gameMemoryStore[gameId].players[1].id);
  });

  test("game status is pending", () => {
    let { gameId } = game;
    assert.strictEqual(gameMemoryStore[gameId].status, "pending");
  });

  test("sets player name", () => {
    let { gameId } = game;
    assert.strictEqual(gameMemoryStore[gameId].players[1].name, "daniel");
  });
});

describe("start game", () => {
  let game;

  before(() => {
    game = createGame("daniel");
  });

  test("game not found", () => {
    let { error } = startGame("meh");
    assert.equal(error, "game with id 'meh' not found");
  });

  test("only creator can start game", () => {
    let { error } = startGame(game.gameId);
    assert.equal(error, "Only game creator can start game");
  });

  test("succesfully start game", () => {
    let gameInMemory = gameMemoryStore[game.gameId];
    let { message } = startGame(game.gameId, gameInMemory.creatorPlayerId);
    // Read again after mutation
    gameInMemory = gameMemoryStore[game.gameId];
    assert.equal(message, "ok");
    assert.equal(gameInMemory.status, "started");
  });

  test("needs at least 3 players o play", () => {
    let newGame = createGame("daniel");
    let gameInMemory = gameMemoryStore[newGame.gameId];
    gameInMemory.players = gameInMemory.players.slice(1);
    let { error } = startGame(newGame.gameId, gameInMemory.creatorPlayerId);
    // Read again after mutation
    gameInMemory = gameMemoryStore[newGame.gameId];
    console.log(error);
    assert.equal(error, "Game needs at least 3 players to start");
    assert.equal(gameInMemory.status, "pending");
  });
});
*/
