/*
 * A minimal playable implementation of the Lizard card game
 * using the core game package and libraries
 * that can be played locally through a CLI
 * Simply run `node tiny.js --play` and follow the instructions to play.
 * @module tiny
 */
import readline from "readline";
import {
  getCurrentPlayerIndex,
  getAggregatePlayerWins,
  getTrickWinners,
  getTrickWinner,
  createNewRound,
  playCard,
  calculateGameScore,
  isValidEstimate,
} from "../packages/game.js";
import { pluralize, getRandomInt } from "../packages/util.js";
import { isValidPlay } from "../packages/game.js";

// Process and wait for user input via CLI
function userInput(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer);
    }),
  );
}

// Base clase for a player
class Player {
  constructor(name) {
    this.name = name;
  }
}

// A "bot" player that just makes random decisions
export class RandomBotPlayer extends Player {
  // Get random etimate
  async estimate(hand) {
    return getRandomInt(0, hand.length);
  }

  // Play random card
  async playCard(hand, trick) {
    let validCardsToPlay = hand.filter((card) =>
      isValidPlay(card, hand, trick),
    );
    return validCardsToPlay[
      Math.floor(Math.random() * validCardsToPlay.length)
    ];
  }
}

// Deterministic "mock" player for testing purposes
export class MockPlayer extends Player {
  // Always guess 1
  async estimate() {
    return 1;
  }
  // Always play first valid card on hand
  async playCard(hand, trick) {
    return hand.find((card) => isValidPlay(card, hand, trick));
  }
}

// A human player awaiting CLI input
export class CLIPlayer extends Player {
  async estimate(hand) {
    console.log("\nYour hand:", hand);
    let input = await userInput(
      "How many tricks do you think you can win?\n=> ",
    );
    return parseFloat(input);
  }
  async playCard(hand, trick) {
    console.log("\nOn the table:", trick);
    console.log("Your hand:", hand);

    let input = await userInput("What card do you want to play?\n=> ");

    // todo validate input
    return input;
  }
}

/**
 * Play a round
 * @param {number} round Number of round to play
 * @param {Array} players List of player objects
 * @returns {object} state The final state and all moves made during the round
 */
export async function playRound(roundCount, players) {
  let round = createNewRound(roundCount, players);

  log(`# Starting round ${roundCount}`);
  log(`- Trump Card: ` + round.trump);

  // -- ESTIMATION PHASE --
  log(`- Estimation Phase`);

  for (const [playerIndex, player] of players.entries()) {
    let estimate;
    let message;
    let validEstimate = false;
    do {
      estimate = await player.estimate(round.moves[0].hands[playerIndex]);
      [validEstimate, message] = isValidEstimate(estimate, roundCount);
      if (message) {
        console.log(message);
      }
    } while (!validEstimate);

    log(
      `-- ${player.name} thinks they can win ${estimate} trick${pluralize(estimate)}`,
    );
    round.playerEstimates.push(estimate);
  }

  // -- PLAY PHASE --
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
      console.log("\nError:", newRound.error, ":", card);
    } else {
      round = newRound;
    }

    let newTricks = newRound.moves.at(-1).tricks;
    if (newTricks.length > tricks.length) {
      log(`-- Playing trick #${tricks.length + 1}`);
    }

    log(`--- Player ${players[currentPlayerIndex].name} plays ${card}`);

    if (newTricks.at(-1).length === players.length) {
      let thisTrickWinner = newTricks.reduceRight((prevTrickWinner, trick) => {
        return getTrickWinner(trick, round.trump[0]) + prevTrickWinner;
      }, 0);
      let playerName = players[thisTrickWinner % hands.length].name;
      log(`--- Winner: ${playerName}`);
    }
  }

  // -- SUMMARY PHASE --
  log("- Round Summary");
  let aggregatePlayerWins = getAggregatePlayerWins(
    getTrickWinners(round),
    players.length,
  );

  let n = 0;
  for (let player of players) {
    let estimate = round.playerEstimates[n];
    let wins = aggregatePlayerWins[n];
    log(
      `-- ${player.name} estimated ${estimate} trick${pluralize(estimate)} and won ${wins}`,
    );
    n++;
  }
  return round;
}

export async function playGame(players, roundsToPlay) {
  if (!roundsToPlay) {
    roundsToPlay = Math.floor(60 / players.length);
  }
  let game = { rounds: [] };
  for (let i = 1; i <= roundsToPlay; i++) {
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
      new RandomBotPlayer("Daniel"),
      new RandomBotPlayer("Button"),
      new RandomBotPlayer("Sara"),
      new RandomBotPlayer("Ruth"),
    ];
    console.log("\nWelcome to Lizard!");
    console.log("\nStarting new game...\n");
    await playGame(players, 3);
  }
}

function log(...args) {
  if (process.env.NODE_ENV !== "test") {
    console.log(new Date().toLocaleTimeString(), "| game log:", ...args);
  }
}

init();
