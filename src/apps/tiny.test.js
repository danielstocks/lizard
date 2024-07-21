import { describe, test } from "node:test";
import assert from "node:assert";

import { MockPlayer } from "../packages/player.js";
import { playRound, playGame } from "./tiny.js";

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
    let result = await playGame(mockPlayers, 1);
    assert.deepStrictEqual(result.rounds[0].moves.at(-1), {
      hands: [[], [], []],
      tricks: [["H2", "H3", "H4"]],
    });
  });

  test("twenty rounds with three players", async () => {
    let result = await playGame(mockPlayers);
    assert.strictEqual(result.rounds.length, 20);
    assert.strictEqual(result.rounds[0].moves.length, 4);
    assert.strictEqual(result.rounds.at(-1).moves.length, 61);
  });
});
