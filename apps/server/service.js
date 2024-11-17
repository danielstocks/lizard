// @ts-check
import { randomUUID } from "node:crypto";
import * as core from "../../packages/game.js";
import { pluralize, getRandomInt } from "../../packages/util.js";
import { broadcast } from "./sse.js";

// Store game state in memory for now
const gameMemoryStore = {};

// Pretend we're logged in as user 0 for now
const authenticatedUserIndex = 0;

// Artifical "thinking" time in ms
const SERVER_WAIT_TIME = 500;

/**
 * @typedef {Object} Action
 * @property {('ESTIMATE'|'PLAY'|'LOG'|'TRUMP'|'DEALER')} type - Indicates the type of action
 * @property {string|number|null} payload - The action payload
 * @property {number|null} playerIndex - Index of player that performed the action (or undefined if system message)
 *
 */

/**
 * @param {object} game
 * @param {Action} action
 */
function log(game, action) {
  let timestamp = new Date().toISOString();
  game.log.push({
    timestamp,
    ...action,
  });
}

/**
 * Helper function for getting active game
 * @param {string} id
 * @returns {object} state Returns current game
 */
function getActiveGame(id) {
  const game = gameMemoryStore[id];
  if (!game) {
    return [undefined, undefined, undefined, { message: "game not found" }];
  }
  if (core.getGamePhase(game) === "DONE") {
    return [undefined, undefined, undefined, { message: "game is over" }];
  }
  let currentRound = game.rounds.at(-1);
  let currentPlayerIndex = core.getCurrentPlayerIndex(currentRound);
  return [game, currentRound, currentPlayerIndex, undefined];
}

/**
 * @param {object} newRoundState
 * @param {object} game
 * @returns {object} game serialized game object
 */
function setGameState(newRoundState, game) {
  game.rounds[game.rounds.length - 1] = newRoundState;
}

/**
 * Serialize game state object
 * @param {object} game object
 * @returns {object} game serialized game object
 */
function serializeGame(game) {
  const currentRound = game.rounds.at(-1);
  const phase = core.getRoundPhase(currentRound);
  return {
    log: game.log,
    id: game.id,
    // TODO, move to core game logic?
    // Update: i haev to or this never happens...
    phase: core.getGamePhase(game),
    players: game.players.map(
      /** @param {object} player */
      (player) => ({
        name: player.name,
        type: player.type,
      }),
    ),
    rounds: game.rounds.map(
      /**
       * @param {object} round
       */
      (round) => ({
        playerEstimates: round.playerEstimates,
        playerTricksWon: core.getAggregatePlayerWins(
          core.getTrickWinners(round),
          game.players.length,
        ),
        phase: core.getRoundPhase(round),
        scores:
          core.getRoundPhase(round) === "DONE"
            ? core.calculateRoundScore(round)
            : [],
      }),
    ),
    currentRound: {
      number: game.rounds.length,
      trump: currentRound.trump,
      currentTrick: core.getCurrentTrick(currentRound),
      dealerOffset: currentRound.dealerOffset,
      phase,
      playerEstimates: currentRound.playerEstimates,
      currentPlayerIndex: ["PLAY", "ESTIMATION"].includes(phase)
        ? core.getCurrentPlayerIndex(currentRound)
        : null,
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
 * @param {object} newCurrentRound
 */
function trickIsCompleted(newCurrentRound) {
  if (core.getRoundPhase(newCurrentRound) === "DONE") {
    return true;
  } else if (
    core.getCurrentTrick(newCurrentRound).length ===
    newCurrentRound.moves.at(-1).hands.length
  ) {
    return true;
  }
  return false;
}

/**
 * @param {number} ms
 */
function sleep(ms = SERVER_WAIT_TIME) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * @param {object} newCurrentRound
 * @param {object} game
 */
function announceTrickWinner(newCurrentRound, game) {
  let trickWinnerPlayerIndex = core.getTrickWinners(newCurrentRound).at(-1);
  let playerName = game.players[trickWinnerPlayerIndex].name;
  log(game, {
    type: "LOG",
    playerIndex: null,
    payload: `- Trick Winner: ${playerName}`,
  });
}

/**
 * @param {object} currentRound
 * @param {object} game
 */
async function runBotEstimations(currentRound, game) {
  let i = 1;
  let timeouts = [];

  while (core.getRoundPhase(currentRound) === "ESTIMATION") {
    let currentPlayerIndex = core.getCurrentPlayerIndex(currentRound);
    let currentPlayer = game.players[currentPlayerIndex];

    if (currentPlayer.type === "bot") {
      let estimate = currentPlayer.estimate(
        core.getPlayerHand(currentRound, currentPlayerIndex),
      );

      core.makeRoundEstimate(currentRound, estimate);

      log(game, {
        type: "ESTIMATE",
        playerIndex: currentPlayerIndex,
        payload: estimate,
      });
      let gameSnapshot = structuredClone(serializeGame(game));
      timeouts.push(
        new Promise((resolve) => {
          setTimeout(() => {
            broadcast({ type: "game", payload: gameSnapshot });
            resolve(true);
          }, i * SERVER_WAIT_TIME);
        }),
      );

      i++;
    } else {
      break;
    }
  }
  await Promise.all(timeouts);
  return currentRound;
}

/**
 * @param {object} currentRound
 * @param {object} game
 */
async function runBotPlays(currentRound, game) {
  let timeouts = [];
  let i = 1;

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
      let cardToPlay =
        validCardsToPlay[Math.floor(Math.random() * validCardsToPlay.length)];

      currentRound = core.playCard(cardToPlay, currentRound);

      log(game, {
        type: "PLAY",
        playerIndex: currentPlayerIndex,
        payload: cardToPlay,
      });

      setGameState(currentRound, game);

      // Meh: Snapshot the game after the play has been made, since update is later
      // broadcasted async
      let gameSnapshot = structuredClone(serializeGame(game));

      timeouts.push(
        new Promise((resolve) => {
          setTimeout(() => {
            broadcast({
              type: "game",
              payload: gameSnapshot,
            });
            resolve(true);
          }, i * SERVER_WAIT_TIME);
        }),
      );

      if (trickIsCompleted(currentRound)) {
        announceTrickWinner(currentRound, game);
        let gameSnapshot = structuredClone(serializeGame(game));
        timeouts.push(
          new Promise((resolve) => {
            setTimeout(
              () => {
                broadcast({ type: "game", payload: gameSnapshot });
                resolve(true);
              },
              (i + 1) * SERVER_WAIT_TIME,
            );
          }),
        );
      }

      i++;
    } else {
      break;
    }
  }

  await Promise.all(timeouts);
  return currentRound;
}

/**
 * @param {number} number
 * @param {object} game
 */
function createRound(number, game) {
  const round = core.createRound(number, game.numberOfPlayers);
  game.rounds.push(round);

  log(game, {
    type: "LOG",
    playerIndex: null,
    payload: `Starting round ${number}`,
  });

  log(game, {
    type: "TRUMP",
    playerIndex: null,
    payload: round.trump,
  });

  log(game, {
    type: "DEALER",
    playerIndex: round.dealerOffset,
    payload: null,
  });

  return round;
}

/**
 * Create a new game and persist game state in memory store
 * @returns {object} gameId Returns unique id of game
 * @param {number} roundsToPlay number of rounds to play
 */
export function createGame(
  roundsToPlay = 1,
  players = [
    { name: "Daniel", type: "human" },
    { name: "Button", type: "bot", estimate: randomEstimate },
    { name: "Scooby Doo", type: "bot", estimate: randomEstimate },
  ],
) {
  broadcast({ type: "debug", payload: { message: "this is a debug message" } });

  const game = core.createGame(players.length, roundsToPlay);
  game.id = randomUUID();
  game.players = players;
  game.log = [];
  gameMemoryStore[game.id] = game;
  const round = createRound(1, game);
  runBotEstimations(round, game);
  return serializeGame(game);
}

/**
 * @param {string} gameId
 * @param {number} estimate
 * @param {function} callback
 * @returns {Promise}
 */
export async function estimate(gameId, estimate, callback) {
  const [game, currentRound, currentPlayerIndex, error] = getActiveGame(gameId);
  if (error) {
    return callback({ error: error.message });
  }
  if (core.getRoundPhase(currentRound) !== "ESTIMATION") {
    return callback({ error: "Current round is not in estimation phase" });
  }
  if (currentPlayerIndex !== authenticatedUserIndex) {
    return callback({ error: "Not your turn to estimate" });
  }

  // Return response, but keep running process in background
  let [updatedRound, estimationError] = core.makeRoundEstimate(
    currentRound,
    estimate,
  );
  if (error) {
    return callback({ error: estimationError });
  }

  log(game, {
    type: "ESTIMATE",
    playerIndex: currentPlayerIndex,
    payload: estimate,
  });

  callback({ status: "ok" });
  broadcast({ type: "game", payload: serializeGame(game) });

  // Let the bots estimate or start playing
  updatedRound = await runBotEstimations(updatedRound, game);
  updatedRound = await runBotPlays(updatedRound, game);
  setGameState(updatedRound, game);
}

/**
 * @param {string} gameId
 * @param {string} card
 * @param {Function} callback
 * @returns {Promise}
 */
export async function play(gameId, card, callback) {
  const [game, currentRound, currentPlayerIndex, error] = getActiveGame(gameId);

  if (error) {
    return callback({ error: error.message });
  }
  if (core.getRoundPhase(currentRound) !== "PLAY") {
    return callback({ error: "Current round is not in play phase" });
  }
  if (currentPlayerIndex !== authenticatedUserIndex) {
    return callback({ error: "It's not your turn to play" });
  }

  let updatedRound = core.playCard(card, currentRound);
  if (updatedRound.error) {
    return callback({ error: updatedRound.error });
  }

  setGameState(updatedRound, game);

  // Let caller know play was OK
  callback({ status: "ok" });

  log(game, {
    type: "PLAY",
    playerIndex: currentPlayerIndex,
    payload: card,
  });

  broadcast({ type: "game", payload: serializeGame(game) });

  if (trickIsCompleted(updatedRound)) {
    await sleep();
    announceTrickWinner(updatedRound, game);
    broadcast({ type: "game", payload: serializeGame(game) });
  }

  // If round is in play phase === runBotPlays
  if (core.getRoundPhase(updatedRound) === "PLAY") {
    updatedRound = await runBotPlays(updatedRound, game);
  }

  if (core.getRoundPhase(updatedRound) === "DONE") {
    //
    // -- SUMMARY PHASE --
    //
    await sleep();

    log(game, {
      type: "LOG",
      playerIndex: null,
      payload: "Round Summary",
    });

    summarizeRound(updatedRound, game);
    broadcast({ type: "game", payload: serializeGame(game) });

    //
    // -- NEW ROUND PHASE --
    //
    await sleep();
    if (game.rounds.length + 1 < game.roundsToPlay) {
      const round = createRound(game.rounds.length + 1, game);
      broadcast({ type: "game", payload: serializeGame(game) });
      // Start next round estimations
      await runBotEstimations(round, game);
    } else {
      log(game, {
        type: "LOG",
        playerIndex: null,
        payload: "Game over!",
      });

      let gameScore = core.calculateGameScore(game);
      gameScore.forEach((score, i) => {
        const isWinner = score === Math.max(...gameScore);
        log(game, {
          type: "SUMMARY",
          playerIndex: i,
          payload: { isWinner, score },
        });
      });

      broadcast({ type: "game", payload: serializeGame(game) });
    }
  }
}
/**
 * @param {object} round
 * @param {object} game
 */
function summarizeRound(round, game) {
  let aggregatePlayerWins = core.getAggregatePlayerWins(
    core.getTrickWinners(round),
    game.players.length,
  );
  for (const [playerIndex, player] of game.players.entries()) {
    let estimate = round.playerEstimates[playerIndex];
    let wins = aggregatePlayerWins[playerIndex];

    log(game, {
      type: "LOG",
      playerIndex: null,
      payload: `- ${player.name} estimated ${estimate} trick${pluralize(estimate)} and won ${wins}`,
    });
  }
}
