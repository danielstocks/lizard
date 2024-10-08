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
  getCurrentPlayerHand,
  getCurrentTrick,
  getCurrentTricks,
  createRound,
  createGame,
  playCard,
  getRoundPhase,
  calculateGameScore,
} from "../../packages/game.js";
import { pluralize } from "../../packages/util.js";
import { RandomBotPlayer, CLIPlayer } from "./player.js";
import { playerLog, log } from "./log.js";

const COLOR_RESET = "\x1b[0m";
const COLOR_MAGENTA = "\x1b[35m";

const players = [
  new CLIPlayer("Daniel"),
  new RandomBotPlayer("Scooby"),
  new RandomBotPlayer("Scrappy"),
  new RandomBotPlayer("Button"),
];

// Automatically initialize on load
init();

/**
 * Initialize game
 */
async function init() {
  var args = process.argv.slice(2);
  // To play the game
  if (args.includes("--play")) {
    playerLog("\nWelcome to Lizard!");
    playerLog("\nStarting new game...\n");
    let game = createGame(players.length);
    await playGame(game);
  }
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

/**
 * Play a round
 * @param {number} roundNumber The current round number
 * @returns {object} state The final state and all moves made during the round
 */
export async function playRound(roundNumber) {
  //
  // -- SETUP PHASE --
  //
  let round = createRound(roundNumber, players.length);
  log(`# Starting round ${roundNumber}`);
  log(`- Trump Card:${COLOR_MAGENTA} ` + round.trump + COLOR_RESET);

  //
  // -- ESTIMATION PHASE --
  //
  log(`- Estimation Phase`);
  while (getRoundPhase(round) === "ESTIMATION") {
    let playerIndex = getCurrentPlayerIndex(round);
    let playerHand = getCurrentPlayerHand(round);
    let player = players[playerIndex];
    let estimate = await player.estimate(playerHand);
    log(
      `-- ${player.name} thinks they can win ${estimate} trick${pluralize(estimate)}`,
    );
    round.playerEstimates[playerIndex] = estimate;
  }

  //
  // -- PLAY PHASE --
  //
  log(`- Play Phase`);
  while (getRoundPhase(round) === "PLAY") {
    let currentTrick = getCurrentTrick(round);
    let currentPlayerIndex = getCurrentPlayerIndex(round);
    let card = await players[currentPlayerIndex].playCard(
      getCurrentPlayerHand(round),
      currentTrick,
    );

    // Start of new trick?
    if (currentTrick.length === 0) {
      log(`-- Playing trick #${getCurrentTricks(round).length}`);
    }

    const newRound = playCard(card, round);
    if (newRound.error) {
      playerLog(`\n${newRound.error}: ${card}`);
      continue;
    }

    log(`--- ${players[currentPlayerIndex].name} plays ${card}`);

    // Trick completed
    if (currentTrick.length === players.length) {
      let trickWinnerPlayerIndex = getTrickWinners(round).at(-1);
      let playerName = players[trickWinnerPlayerIndex].name;
      log(`--- Winner: ${playerName}`);
    }

    // Lastly, overwrite old round
    round = newRound;
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
