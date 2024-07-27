import { describe, test } from "node:test";
import assert from "node:assert";
import { createGame, gameMemoryStore } from "./server.js";

describe("create new game", () => {
  test("creates a new game with gameId", () => {
    let { gameId } = createGame();
    assert.strictEqual(gameId, gameMemoryStore[gameId].id);
  });

  test("creates a new game with creatorPlayerId", () => {
    let { gameId, playerId } = createGame();
    assert.strictEqual(playerId, gameMemoryStore[gameId].creatorPlayerId);
  });
});
