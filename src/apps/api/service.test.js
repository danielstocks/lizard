import { describe, test } from "node:test";
import assert from "node:assert";
import { createGame, estimate, play } from "./service.js";

let gameId;

/* A test that creates a game with3 rounds and plays them all */
describe("service", () => {
  test("create game", () => {
    let game = createGame();
    gameId = game.id;
    assert.equal(game.players.length, 3);
    assert.equal(game.currentRound.number, 1);
  });

  // Round 1
  test("estimate", () => {
    let result = estimate(gameId, 0);
    assert.equal(result.currentRound.number, 1);
    assert.deepStrictEqual(result.currentRound.playerEstimates, [0, 1, 1]);
  });

  test("play", () => {
    let result = play(gameId, "H2");
    assert.equal(result.currentRound.number, 2);
    assert.deepStrictEqual(result.currentRound.playerEstimates, [
      undefined,
      1,
      1,
    ]);
  });

  // Round 2
  test("estimate", () => {
    let result = estimate(gameId, 1);
    assert.equal(result.currentRound.number, 2);
    assert.deepStrictEqual(result.currentRound.playerEstimates, [1, 1, 1]);
  });

  test("play", () => {});
  test("play", () => {});

  // Round 3
  test("estimate", () => {});
  test("play", () => {});
  test("play", () => {});
  test("play", () => {});
});
