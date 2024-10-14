// @ts-check
import { randomUUID } from "node:crypto";
import * as core from "../../packages/game.js";
import { pluralize, getRandomInt } from "../../packages/util.js";

/* Object to save game state */
const gameMemoryStore = {};

// Pretend we're logged in as user 0 for now
const authenticatedUserIndex = 0;

/**
 * @param {object} game
 * @param {string} message
 */
function log(game, message) {
  let timestamp = new Date().toISOString();
  game.log.push({
    timestamp,
    message,
  });
  /* Future idea for log: Structured data?
  {
    timestamp: "2024-09-04 14:53.21",
    action: "PLAY_CARD",
    value: "D4",
    playerIndex: 0
  }
  */
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
  let currentRound = game.rounds.at(-1);
  if (core.getGamePhase(game, currentRound) === "DONE") {
    return [undefined, undefined, undefined, { message: "game is over" }];
  }
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
 * Create a new game and persist game state in memory store
 * @param {object} game object
 * @returns {object} game serialized game object
 */
function serializeGame(game) {
  let currentRound = game.rounds.at(-1);
  return {
    log: game.log,
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
      trump: currentRound.trump,
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
 * @param {object} newCurrentRound
 */
function trickIsCompleted(newCurrentRound) {
  if (core.getRoundPhase(newCurrentRound) === "DONE") {
    return true;
  } else if (core.getCurrentTrick(newCurrentRound).length === 0) {
    return true;
  }
  return false;
}

/**
 * @param {object} newCurrentRound
 * @param {object} game
 */
function announceTrickWinner(newCurrentRound, game) {
  let trickWinnerPlayerIndex = core.getTrickWinners(newCurrentRound).at(-1);
  let playerName = game.players[trickWinnerPlayerIndex].name;
  log(game, `- Trick Winner: ${playerName}`);
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
      let estimate = currentPlayer.estimate(
        core.getPlayerHand(currentRound, currentPlayerIndex),
      );
      core.makeRoundEstimate(currentRound, estimate);

      log(
        game,
        "- " +
          game.players[currentPlayerIndex].name +
          " thinks they can win " +
          estimate +
          " trick" +
          pluralize(estimate),
      );
    } else {
      break;
    }
  }
  return currentRound;
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
      let cardToPlay =
        validCardsToPlay[Math.floor(Math.random() * validCardsToPlay.length)];
      currentRound = core.playCard(cardToPlay, currentRound);
      log(
        game,
        "- " + game.players[currentPlayerIndex].name + " played " + cardToPlay,
      );

      if (trickIsCompleted(currentRound)) {
        announceTrickWinner(currentRound, game);
      }
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
  game.log = [];
  log(game, "Starting round #1");
  gameMemoryStore[game.id] = game;
  runBotEstimations(round, game);
  return serializeGame(game);
}

/**
 * @param {string} gameId
 * @param {number} estimate
 * @returns {object} game serialized game object
 */
export function estimate(gameId, estimate) {
  const [game, currentRound, currentPlayerIndex, error] = getActiveGame(gameId);
  if (error) {
    return { error: error.message };
  }
  if (core.getRoundPhase(currentRound) !== "ESTIMATION") {
    return { error: "Current round is not in estimation phase" };
  }
  if (currentPlayerIndex !== authenticatedUserIndex) {
    return { error: "Not your turn to estimate" };
  }

  // Thought: maybe makeRoundEstimate should validate and return error
  // instead of extra step here (and make it more similar to PlayCard
  let [isValidEstimate, message] = core.isValidEstimate(
    estimate,
    game.rounds.length,
  );
  if (!isValidEstimate) {
    return { error: message };
  }

  log(
    game,
    "- " +
      game.players[currentPlayerIndex].name +
      " thinks they can win " +
      estimate +
      " trick" +
      pluralize(estimate),
  );

  setGameState(
    runBotPlays(
      runBotEstimations(core.makeRoundEstimate(currentRound, estimate), game),
      game,
    ),
    game,
  );
  return serializeGame(game);
}

/**
 * @param {string} gameId
 * @param {string} card
 */
export function play(gameId, card) {
  const [game, currentRound, currentPlayerIndex, error] = getActiveGame(gameId);

  if (error) {
    return { error: error.message };
  }

  // Validation
  if (core.getRoundPhase(currentRound) !== "PLAY") {
    return { error: "Current round is not in play phase" };
  }
  if (currentPlayerIndex !== authenticatedUserIndex) {
    return { error: "Not your turn to play" };
  }

  let newCurrentRound = core.playCard(card, currentRound);
  if (newCurrentRound.error) {
    return { error: newCurrentRound.error };
  }

  setGameState(newCurrentRound, game);
  log(game, "- " + game.players[currentPlayerIndex].name + " played " + card);

  if (trickIsCompleted(newCurrentRound)) {
    announceTrickWinner(newCurrentRound, game);
  }

  // If round is in play phase === runBotPlays
  if (core.getRoundPhase(newCurrentRound) === "PLAY") {
    newCurrentRound = runBotPlays(newCurrentRound, game);
    setGameState(newCurrentRound, game);
  }

  // If round is is done phase === start next round
  if (core.getRoundPhase(newCurrentRound) === "DONE") {
    if (core.getGamePhase(game, newCurrentRound) === "DONE") {
      return { error: "game is over" };
    }

    //
    // -- SUMMARY PHASE --
    //
    log(game, "Round Summary");
    let aggregatePlayerWins = core.getAggregatePlayerWins(
      core.getTrickWinners(newCurrentRound),
      game.players.length,
    );
    for (const [playerIndex, player] of game.players.entries()) {
      let estimate = newCurrentRound.playerEstimates[playerIndex];
      let wins = aggregatePlayerWins[playerIndex];
      log(
        game,
        `- ${player.name} estimated ${estimate} trick${pluralize(estimate)} and won ${wins}`,
      );
    }

    const round = core.createRound(
      game.rounds.length + 1,
      game.numberOfPlayers,
    );
    log(game, "Starting round " + (game.rounds.length + 1));
    runBotEstimations(round, game);
    game.rounds.push(round);
  }

  return serializeGame(game);
}
