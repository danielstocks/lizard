import { randomUUID } from "node:crypto";

let gameMemoryStore = {};

export function startNewGame() {
  // Createw new unique gameId
  let gameId = randomUUID();
  gameMemoryStore[gameId] = { gameId };
  return {
    gameId,
  };
}

export function estimate(gameId) {
  if (gameMemoryStore[gameId]) {
    return {
      message: "ok",
    };
  } else {
    return {
      error: "gameId not found",
    };
  }
}

export function playCard(gameId) {
  if (gameMemoryStore[gameId]) {
    return {
      message: "ok",
    };
  } else {
    return {
      error: "gameId not found",
    };
  }
}
