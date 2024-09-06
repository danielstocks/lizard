/*
 * A minimal playable implementation of the Lizard card game
 * that can be played locally through a CLI
 * Uses the core game package and libraries.
 * To play, simply run `node tiny.js --play` and follow the instructions.
 * @module tiny
 */
import {
  getCurrentPlayerIndex,
  getAggregatePlayerWins,
  getTrickWinners,
  createRound,
  getOffsetPlayerHand,
  createGame,
  playCard,
  calculateGameScore,
  isValidEstimate,
} from "../../packages/game.js";
import { pluralize, offsetArray } from "../../packages/util.js";
import { RandomBotPlayer, CLIPlayer } from "./player.js";
import { playerLog, log } from "./log.js";

function estimationPhase(round, players) {
  return offsetArray(players, -round.dealerOffset).entries();
}

function isPlayPhase(round) {
  return round.moves.at(-1).hands.flat().length > 0;
}

const players = [
  new CLIPlayer("Daniel"),
  new RandomBotPlayer("Scooby"),
  new RandomBotPlayer("Scrappy"),
  //new RandomBotPlayer("Button"),
];

/**
 * Play a round
 * @param {number} roundNumber The current round number
 * @param {Array} players List of player objects
 * @returns {object} state The final state and all moves made during the round
 */
export async function playRound(roundNumber) {
  //
  // -- SETUP PHASE --
  //
  let round = createRound(roundNumber, players.length);
  log(`# Starting round ${roundNumber}`);
  log(`- Trump Card: ` + round.trump);

  //
  // -- ESTIMATION PHASE --
  //
  log(`- Estimation Phase`);
  for (const [playerIndex, player] of estimationPhase(round, players)) {
    let playerHand = getOffsetPlayerHand(round, playerIndex);
    let estimate;
    let message;
    let validEstimate;

    do {
      estimate = await player.estimate(playerHand);
      [validEstimate, message] = isValidEstimate(estimate, roundNumber);
      if (message) {
        playerLog(message);
      }
    } while (!validEstimate);

    log(
      `-- ${player.name} thinks they can win ${estimate} trick${pluralize(estimate)}`,
    );
    round.playerEstimates[playerIndex] = estimate;
  }

  //
  // -- PLAY PHASE --
  //
  log(`- Play Phase`);
  while (isPlayPhase(round)) {
    let tricks = round.moves.at(-1).tricks;
    let hands = round.moves.at(-1).hands;
    let currentTrick = tricks[tricks.length - 1] || [];

    let currentPlayerIndex = getCurrentPlayerIndex(round);

    let card = await players[currentPlayerIndex].playCard(
      hands[currentPlayerIndex],
      currentTrick,
    );

    const newRound = playCard(card, round);

    if (newRound.error) {
      playerLog(`\n${newRound.error}: ${card}`);
      continue;
    }
    round = newRound;
    // Start of new trick?
    let newTricks = newRound.moves.at(-1).tricks;
    if (newTricks.length > tricks.length) {
      log(`-- Playing trick #${tricks.length + 1}`);
    }

    // Log current play (after start and before end of trick)
    log(`--- Player ${players[currentPlayerIndex].name} plays ${card}`);

    // End of current trick?
    if (newTricks.at(-1).length === players.length) {
      let trickWinnerPlayerIndex = getTrickWinners(newRound).at(-1);
      let playerName = players[trickWinnerPlayerIndex].name;
      log(`--- Winner: ${playerName}`);
    }
  }

  //
  // -- SUMMARY PHASE --
  //
  log("- Round Summary");
  let aggregatePlayerWins = getAggregatePlayerWins(
    getTrickWinners(round),
    players.length,
  );
  for (const [playerIndex, player] of players.entries()) {
    let estimate = round.playerEstimates[playerIndex];
    let wins = aggregatePlayerWins[playerIndex];
    log(
      `-- ${player.name} estimated ${estimate} trick${pluralize(estimate)} and won ${wins}`,
    );
  }
  return round;
}

/**
 * Play a game
 * @param {object} game start state of game
 * @returns {object} game end state of game
 */
export async function playGame(game) {
  for (let i = 1; i <= game.roundsToPlay; i++) {
    let round = await playRound(i);

    game.rounds.push(round);

    let gameScore = calculateGameScore(game);

    log("- Accumulated scores:");
    gameScore.forEach((score, i) => {
      log("--", players[i].name, score);
    });
  }
  log("# Game over");

  let gameScore = calculateGameScore(game);
  gameScore.forEach((score, i) => {
    const isWinner = score === Math.max(...gameScore);
    log("-", players[i].name, score, isWinner ? "- WINNER!" : "");
  });

  return game;
}

async function init() {
  var args = process.argv.slice(2);
  if (args.includes("--play")) {
    playerLog("\nWelcome to Lizard!");
    playerLog("\nStarting new game...\n");
    let game = createGame(players.length, 3);
    await playGame(game);
  }
}

init();
