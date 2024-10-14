import { describe, test } from "node:test";
import assert from "node:assert";
import { createGame, estimate, play } from "./service.js";

let gameId;

/* A test that creates a game with3 rounds and plays them all */
describe("service", () => {
  test("create game", () => {
    let game = createGame(3);
    gameId = game.id;
    assert.equal(game.players.length, 3);
    assert.equal(game.currentRound.number, 1);
  });

  // Round 1
  test("estimate round one", () => {
    console.log("TESTING ROUND 1");
    let result = estimate(gameId, 0);
    assert.equal(result.currentRound.dealerOffset, 0);
    assert.equal(result.currentRound.number, 1);
    assert.deepStrictEqual(result.currentRound.playerEstimates, [0, 1, 1]);
  });

  test("play round one", () => {
    let result = play(gameId, "H2");
    assert.equal(result.currentRound.number, 2);
    assert.deepStrictEqual(result.currentRound.playerEstimates, [
      undefined,
      1,
      1,
    ]);
  });

  // Round 2
  test("estimate round two", () => {
    console.log("TESTING ROUND 2");

    let result = estimate(gameId, 1);
    assert.equal(result.currentRound.dealerOffset, 1);
    assert.equal(result.currentRound.number, 2);
    assert.deepStrictEqual(result.currentRound.playerEstimates, [1, 1, 1]);
  });

  test("play round two first card", () => {
    let result = play(gameId, "H4");
    assert.deepStrictEqual(result.currentRound.authenticatedPlayerHand, ["H7"]);
  });

  test("play round two second card", () => {
    let result = play(gameId, "H7");
    assert.equal(result.currentRound.number, 3);
  });

  // Round 3
  test("estimate third round", () => {
    let result = estimate(gameId, 0);
    assert.equal(result.currentRound.dealerOffset, 2);
    assert.equal(result.currentRound.number, 3);
    assert.deepStrictEqual(result.currentRound.playerEstimates, [0, 1, 1]);
  });

  test("play third round first card", () => {
    let result = play(gameId, "H3");
    assert.equal(result.currentRound.number, 3);
  });

  test("play third round second card", () => {
    let result = play(gameId, "H6");
    assert.equal(result.currentRound.number, 3);
  });
  test("play third round third card", () => {
    let result = play(gameId, "H9");
    assert.deepStrictEqual(result, { error: "game is over" });
  });

  // Game over
  test("play when game is over", () => {
    console.log(process.env.NODE_ENV);
    let result = play(gameId, "LIZARD");
    assert.deepStrictEqual(result, { error: "game is over" });
  });

  test("estimate when game is over", () => {
    let result = estimate(gameId, 0);
    assert.deepStrictEqual(result, { error: "game is over" });
  });
});
