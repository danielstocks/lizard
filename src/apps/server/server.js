// @ts-check
import * as core from "../../packages/game.js";
import { randomUUID } from "node:crypto";
import { RandomBotPlayer } from "./bot-player.js";

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
      new RandomBotPlayer("Scooby", "bot-1"),
      {
        name: playerName,
        id: playerId,
        type: "human",
      },
      new RandomBotPlayer("Wilma", "bot-2"),
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
    if (game.players.length < 3) {
      return {
        error: "Game needs at least 3 players to start",
      };
    }
    gameMemoryStore[gameId] = core.startGame(game);

    for (var player of game.players) {
      if (player.type === "human") break;
      estimate(gameId, player.id, player.estimate([]));
    }

    // Once the game has started:
    // First Round starts
    // -- Wait for first player estimation
    // ---- If bot, do it automatically
    // ---- If human, wait for estimate function to be called

    return {
      message: "ok",
    };
  } else {
    return {
      error: "game with id '" + gameId + "' not found",
    };
  }
}

/**
 * Recieve player estimate
 * @param {string} gameId of game
 * @param {string} playerId of player estimating
 * @param {string} estimate
 */
export function estimate(gameId, playerId, estimate) {
  let game = gameMemoryStore[gameId];
  if (game) {
    // Check first that game is in estimation phase
    // Check that it's the players turn to estimate
    // -- Run estimate
    // -- Run any bot player estimates
    // -- Wait for additional estimates
    // If all players have estimated, move on to play phase
    // console.log("estimate", playerId, estimate);

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
 * @param {string} gameId of game
 * @param {string} playerId of player estimating
 * @param {string} card to play
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
