// @ts-check
import * as core from "../../packages/game.js";
import { randomUUID } from "node:crypto";
import { getRandomInt } from "../../packages/util.js";

/* Object to save game state */
const gameMemoryStore = {};

// Pretend we're logged in as user 0 for now
const authenticatedUserIndex = 0;

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
    players: game.players.map(
      /** @param {object} player */
      (player) => ({
        name: player.name,
        type: player.type,
      }),
    ),
    currentRound: {
      dealerOffset: currentRound.dealerOffset,
      phase: core.getRoundPhase(currentRound),
      playerEstimate: currentRound.playerEstimates,
      currentPlayerIndex: core.getCurrentPlayerIndex(currentRound),
      authenticatedPlayerHand: core.getPlayerHand(
        currentRound,
        authenticatedUserIndex,
      ),
    },
  };
}

/**
 * @param {Array} hand
 */
function randomEstimate(hand) {
  return getRandomInt(0, hand.length);
}

/**
 * @param {object} currentRound
 * @param {object} game
 */
function makeBotEstimations(currentRound, game) {
  while (core.getRoundPhase(currentRound) === "ESTIMATION") {
    let currentPlayerIndex = core.getCurrentPlayerIndex(currentRound);
    let currentPlayer = game.players[currentPlayerIndex];
    if (currentPlayer.type === "bot") {
      currentRound.playerEstimates[currentPlayerIndex] = currentPlayer.estimate(
        core.getPlayerHand(currentRound, currentPlayerIndex),
      );
    } else {
      break;
    }
  }
}

/**
 * Create a new game and persist game state in memory store
 * @returns {object} gameId Returns unique id of game
 */
export function createGame() {
  let players = [
    { name: "Daniel", type: "human" },
    { name: "Button", type: "bot", estimate: randomEstimate },
    { name: "Bruno", type: "bot", estimate: randomEstimate },
  ];
  let game = core.createGame(players.length, 3);
  const round = core.createRound(3, game.numberOfPlayers);
  game.id = randomUUID();
  game.rounds.push(round);
  game.players = players;
  gameMemoryStore[game.id] = game;

  makeBotEstimations(round, game);

  return serializeGame(game);
}

/**
 * @param {string} gameId
 * @param {number} estimate
 */
export function estimate(gameId, estimate) {
  const [game, error] = getGame(gameId);
  if (error) {
    return { error: error.message };
  }

  let currentRound = game.rounds.at(-1);
  let currentPlayerIndex = core.getCurrentPlayerIndex(currentRound);

  // Validation
  if (core.getRoundPhase(currentRound) !== "ESTIMATION") {
    return { error: "Round is not in estimation phase" };
  }
  if (currentPlayerIndex !== authenticatedUserIndex) {
    return { error: "Not your turn to estimate" };
  }
  let [isValidEstimate, message] = core.isValidEstimate(
    estimate,
    game.rounds.length,
  );
  if (!isValidEstimate) {
    return { error: message };
  }

  // Proceed with estimation
  currentRound.playerEstimates[authenticatedUserIndex] = estimate;
  makeBotEstimations(currentRound, game);
  return serializeGame(game);
}

// ---- RUN GAME BELOW ----
let response;
response = createGame();
console.log("\ncreate game response", response);
response = estimate(response.id, 1);
console.log("\nestimate response", response);
