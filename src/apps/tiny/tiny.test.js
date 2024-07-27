import { describe, test } from "node:test";
import assert from "node:assert";

import { playRound, playGame } from "./tiny.js";
import { createGame } from "../../packages/game.js";
import { MockPlayer } from "./player.js";

let mockPlayers = [
  new MockPlayer("Daniel"),
  new MockPlayer("Ruth"),
  new MockPlayer("Sara"),
];

describe("play round", () => {
  test("three with three players", async () => {
    let result = await playRound(3, mockPlayers);
    assert.deepStrictEqual(result.moves.at(-1), {
      hands: [[], [], []],
      tricks: [
        ["H2", "H3", "H4"],
        ["H7", "H5", "H6"],
        ["H10", "H8", "H9"],
      ],
    });
  });
});

describe("play game", () => {
  test("one round with three players", async () => {
    let game = createGame({ players: mockPlayers, roundsToPlay: 1 });
    let result = await playGame(game, 1);
    assert.deepStrictEqual(result.rounds[0].moves.at(-1), {
      hands: [[], [], []],
      tricks: [["H2", "H3", "H4"]],
    });
    assert.equal(result.rounds.length, 1);
  });

  test("twenty rounds with three players", async () => {
    let game = createGame({ players: mockPlayers });
    let result = await playGame(game, 1);
    assert.strictEqual(result.rounds.length, 20);
    assert.strictEqual(result.rounds[0].moves.length, 4);
    assert.strictEqual(result.rounds.at(-1).moves.length, 61);
  });
});
