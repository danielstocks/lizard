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
  createGame,
  playCard,
  calculateGameScore,
  isValidEstimate,
} from "../../packages/game.js";
import { pluralize, offsetArray, offsetIndex } from "../../packages/util.js";
import { RandomBotPlayer } from "./player.js";
import { playerLog, log } from "./log.js";

/**
 * Play a round
 * @param {number} round Number of round to play
 * @param {Array} players List of player objects
 * @returns {object} state The final state and all moves made during the round
 */
export async function playRound(roundCount, players) {
  //
  // -- SETUP PHASE --
  //
  let round = createRound(roundCount, players);
  log(`# Starting round ${roundCount}`);
  log(`- Trump Card: ` + round.trump);

  //
  // -- ESTIMATION PHASE --
  //
  log(`- Estimation Phase`);
  for (const [playerIndex, player] of offsetArray(
    players,
    -round.dealerOffset,
  ).entries()) {
    let offsetPlayerIndex = offsetIndex(
      playerIndex,
      players.length,
      round.dealerOffset,
    );
    let estimate;
    let message;
    let validEstimate;
    do {
      estimate = await player.estimate(round.moves[0].hands[offsetPlayerIndex]);
      [validEstimate, message] = isValidEstimate(estimate, roundCount);
      if (message) {
        playerLog(message);
      }
    } while (!validEstimate);
    log(
      `-- ${player.name} thinks they can win ${estimate} trick${pluralize(estimate)}`,
    );
    round.playerEstimates.push(estimate);
  }

  //
  // -- PLAY PHASE --
  //
  log(`- Play Phase`);
  // Play until all hands in round are empty
  while (round.moves.at(-1).hands.flat().length > 0) {
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
      playerLog("\nError:", newRound.error, ":", card);
    } else {
      round = newRound;
    }
    let newTricks = newRound.moves.at(-1).tricks;
    if (newTricks.length > tricks.length) {
      log(`-- Playing trick #${tricks.length + 1}`);
    }
    log(`--- Player ${players[currentPlayerIndex].name} plays ${card}`);
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
 * @param {object} game The game object to play
 * @returns {object} state The final state and all moves made during the round
 */
export async function playGame(game) {
  let players = game.players;
  for (let i = 1; i <= game.roundsToPlay; i++) {
    let round = await playRound(i, players);

    game.rounds.push(round);

    let gameScore = calculateGameScore(game);

    log("- Accumulated scores:");
    gameScore.forEach((score, i) => {
      log("--", players[i].name, score);
    });
  }
  log("# Game over");

  let gameScore = calculateGameScore(game);
  let winningScore = Math.max(...gameScore);

  gameScore.forEach((score, i) => {
    let winner = false;
    if (score === winningScore) {
      winner = true;
    }
    log("-", players[i].name, score, winner ? "- WINNER!" : "");
  });

  return game;
}

async function init() {
  var args = process.argv.slice(2);
  if (args.includes("--play")) {
    let players = [
      //new CLIPlayer("Daniel"),
      //new RandomBotPlayer("Daniel"),
      new RandomBotPlayer("Button"),
      new RandomBotPlayer("Sara"),
      new RandomBotPlayer("Ruth"),
    ];
    playerLog("\nWelcome to Lizard!");
    playerLog("\nStarting new game...\n");
    let game = createGame({ players });
    await playGame(game);
  }
}

init();
