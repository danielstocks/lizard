import { describe, test } from "node:test";
import assert from "node:assert";
import { startGame, gameMemoryStore } from "./server.js";

describe("start game", () => {
  test("creates a new game", () => {
    let game = startGame();
    assert.strictEqual(game.id, gameMemoryStore[game.id].id);
  });
});
