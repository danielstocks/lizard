// @ts-check
import * as core from "../../packages/game.js";
import { randomUUID } from "node:crypto";

/* Save game in memory for now, add SQLIte later for persistence */
export const gameMemoryStore = {};

/**
 * Allows a player to start a new game
 * @param {string} playerName Name of player
 * @returns {object} newGame Returns gameID and playerID of game creator
 */
export function createGame(playerName) {
  let gameId = randomUUID();
  let playerId = randomUUID();
  let game = core.createGame({
    id: gameId,
    status: "pending",
    creatorPlayerId: playerId,
    players: [
      {
        name: playerName,
        id: playerId,
      },
      {
        id: "bot-1",
        name: "Scooby",
        type: "bot",
      },
      {
        id: "bot-2",
        name: "Wilma",
        type: "bot",
      },
    ],
  });
  gameMemoryStore[gameId] = game;
  return {
    gameId,
    playerId,
  };
}

/**
 * Return error if not enough players (min 3)
 * set game status to started, can only be called by gameCreatorId(?)
 * @param {object} gameId id of game
 * @param {string} playerId of player estimating
 */
export function startGame(gameId, playerId) {
  let game = gameMemoryStore[gameId];
  if (game) {
    if (playerId !== game.creatorPlayerId) {
      return {
        error: "Only game creator can start game",
      };
    }
    core.startGame(game);
    return {
      message: "ok",
    };
  } else {
    return {
      error: "gameId not found",
    };
  }
}

/**
 * Attempt to estimate
 * return error if it's invalid estimate
 * or not players turn
 * if successfull estimate, run any bot players
 * turns immedetieatly afterwards
 * @param {string} gameId of game
 * @param {string} playerId of player estimating
 * @param {string} estimate
 */
export function estimate(gameId, playerId, estimate) {
  let game = gameMemoryStore[gameId];
  if (game) {
    return {
      message: "ok",
    };
  } else {
    return {
      error: "gameId not found",
    };
  }
}

/**
 * Attempt to playCard
 * return error if it's invalid estimate
 * or not players turn
 * if successfull estimate, run any bot players
 * turns immedetieatly afterwards
 */
export function playCard(gameId, playerId, card) {
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

/**
 * Allow player to join game, returns a playerID that the player
 * can later use to perform actions on behalf of that player
 * Return error if game is full, or if game status is not pending
 * @param {string} name Name of player
 */
// TODO: export function joinGame(name) {}
