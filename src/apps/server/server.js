// @ts-check
import * as core from "../../packages/game.js";
import { randomUUID } from "node:crypto";

/* Object to save game state */
const gameMemoryStore = {};

/**
 * Helper function for getting game from memory store
 * @param {string} id
 * @returns {object} state Returns current game
 */
function getGame(id) {
  const game = gameMemoryStore[id];
  if (!game) {
    return [undefined, { message: "game not found" }];
  }
  return [game, undefined];
}
/**
 * Create a new game and persist game state in memory store
 * @param {object} game object
 * @returns {object} game serialized game object
 */
function serializeGame(game) {
  let currentRound = game.rounds.at(-1);
  return {
    id: game.id,
    players: game.players,
    currentRound: {
      dealerOffset: currentRound.dealerOffset,
      phase: core.getRoundPhase(currentRound),
      playerEstimate: currentRound.playerEstimates,
      currentPlayerIndex: core.getCurrentPlayerIndex(currentRound),
    },
  };
}

/**
 * Create a new game and persist game state in memory store
 * @returns {object} gameId Returns unique id of game
 */
export function createGame() {
  let players = [
    { name: "Daniel", type: "human" },
    { name: "Button", type: "bot" },
    { name: "Bruno", type: "bot" },
  ];
  let game = core.createGame(players.length, 3);

  game.id = randomUUID();
  game.rounds.push(core.createRound(1, game.numberOfPlayers));
  game.players = players;
  gameMemoryStore[game.id] = game;

  return serializeGame(game);
}

/**
 * @param {string} gameId
 * @param {number} estimate
 */
export function estimate(gameId, estimate) {
  const [game, error] = getGame(gameId);
  if (error) {
    return error.message;
  }

  console.log("Player estimate:", estimate);

  game.rounds.at(-1).playerEstimates[0] = 1;
  game.rounds.at(-1).playerEstimates[1] = 2;
  game.rounds.at(-1).playerEstimates[2] = 1;

  return serializeGame(game);
}

// ---- RUN GAME BELOW ----
let response;
response = createGame();
console.log("create game response", response);
response = estimate(response.id, 1);
console.log(response);
