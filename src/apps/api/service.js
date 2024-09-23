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
      number: game.rounds.length,
      currentTrick: core.getCurrentTrick(currentRound),
      dealerOffset: currentRound.dealerOffset,
      phase: core.getRoundPhase(currentRound),
      playerEstimates: currentRound.playerEstimates,
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
  // Determinstic for testing purposes
  if (process.env.NODE_ENV === "test") {
    return 1;
  }
  return getRandomInt(0, hand.length);
}

/**
 * @param {object} currentRound
 * @param {object} game
 */
function runBotEstimations(currentRound, game) {
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
 * @param {object} currentRound
 * @param {object} game
 */
function runBotPlays(currentRound, game) {
  while (core.getRoundPhase(currentRound) === "PLAY") {
    let currentPlayerIndex = core.getCurrentPlayerIndex(currentRound);
    let currentPlayer = game.players[currentPlayerIndex];
    let currentPlayerHand = core.getCurrentPlayerHand(currentRound);
    let currentTrick = core.getCurrentTrick(currentRound);
    if (currentPlayer.type === "bot") {
      let validCardsToPlay = currentPlayerHand.filter(
        /** @param {string} card */
        (card) => core.isValidPlay(card, currentPlayerHand, currentTrick),
      );
      currentRound = core.playCard(
        validCardsToPlay[Math.floor(Math.random() * validCardsToPlay.length)],
        currentRound,
      );
    } else {
      break;
    }
  }
  return currentRound;
}

/**
 * Create a new game and persist game state in memory store
 * @returns {object} gameId Returns unique id of game
 * @param {number} roundsToPlay number of rounds to play
 */
export function createGame(
  roundsToPlay,
  players = [
    { name: "Daniel", type: "human" },
    { name: "Button", type: "bot", estimate: randomEstimate },
    { name: "Bruno", type: "bot", estimate: randomEstimate },
  ],
) {
  const game = core.createGame(players.length, roundsToPlay);
  const round = core.createRound(1, game.numberOfPlayers);
  game.id = randomUUID();
  game.rounds.push(round);
  game.players = players;
  gameMemoryStore[game.id] = game;
  runBotEstimations(round, game);
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

  if (core.getGamePhase(game, currentRound) === "DONE") {
    return { error: "game is over" };
  }

  let currentPlayerIndex = core.getCurrentPlayerIndex(currentRound);

  // Validation
  if (core.getRoundPhase(currentRound) !== "ESTIMATION") {
    return { error: "Current round is not in estimation phase" };
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

  // Tick tock...
  runBotEstimations(currentRound, game);
  // Immutable or mutable... make your bloody mind up
  let updated = runBotPlays(currentRound, game);
  game.rounds[game.rounds.length - 1] = updated;

  return serializeGame(game);
}

/**
 * @param {string} gameId
 * @param {string} card
 */
export function play(gameId, card) {
  const [game, error] = getGame(gameId);

  if (error) {
    return { error: error.message };
  }

  let currentRound = game.rounds.at(-1);

  if (core.getGamePhase(game, currentRound) === "DONE") {
    return { error: "game is over" };
  }

  let currentPlayerIndex = core.getCurrentPlayerIndex(currentRound);

  // Validation
  if (core.getRoundPhase(currentRound) !== "PLAY") {
    return { error: "Current round is not in play phase" };
  }
  if (currentPlayerIndex !== authenticatedUserIndex) {
    return { error: "Not your turn to play" };
  }

  let currentPlayerHand = core.getCurrentPlayerHand(currentRound);
  let currenTrick = core.getCurrentTrick(currentRound);

  if (!core.isValidPlay(card, currentPlayerHand, currenTrick)) {
    return { error: "invalid play" };
  }

  // Immutable or mutable... make your bloody mind up
  currentRound = core.playCard(card, currentRound);
  game.rounds[game.rounds.length - 1] = currentRound;

  if (currentRound.error) {
    return { error: currentRound.error };
  }

  // If round is in play phase === runBotPlays
  if (core.getRoundPhase(currentRound) === "PLAY") {
    // Immutable or mutable... make your bloody mind up
    currentRound = runBotPlays(currentRound, game);
    game.rounds[game.rounds.length - 1] = currentRound;
  }

  // If round is is done phase === start next round
  if (core.getRoundPhase(currentRound) === "DONE") {
    if (core.getGamePhase(game, currentRound) === "DONE") {
      return { error: "game is over" };
    }

    const round = core.createRound(
      game.rounds.length + 1,
      game.numberOfPlayers,
    );

    // Tick tock...
    runBotEstimations(round, game);
    game.rounds.push(round);
  }

  return serializeGame(game);
  // Return serialized game
}
