// @ts-check
import { createGame } from "../packages/game.js";

export const gameMemoryStore = {};

export function startGame() {
  let game = createGame();
  gameMemoryStore[game.id] = game;
  return game;
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
