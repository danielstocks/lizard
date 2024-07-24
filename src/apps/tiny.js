/*
 * A minimal playable implementation of the Lizard card game
 * that can be played locally through a CLI
 * Uses the core game package and libraries.
 * To play, simply run `node tiny.js --play` and follow the instructions.
 * @module tiny
 */
import readline from "readline";
import {
  getCurrentPlayerIndex,
  getAggregatePlayerWins,
  getTrickWinners,
  createNewRound,
  createNewGame,
  playCard,
  calculateGameScore,
  isValidEstimate,
  isValidPlay,
} from "../packages/game.js";
import {
  pluralize,
  getRandomInt,
  offsetArray,
  offsetIndex,
} from "../packages/util.js";

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

// Base class for a player
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
    playerLog("\nYour hand:", hand);
    let input = await userInput(
      "How many tricks do you think you can win?\n=> ",
    );
    return parseFloat(input);
  }
  async playCard(hand, trick) {
    playerLog("\nOn the table:", trick);
    playerLog("Your hand:", hand);

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
export async function playRound(roundCount, players, dealerOffset) {
  // -- SETUP ROUND --
  let round = createNewRound(roundCount, players, dealerOffset);
  log(`# Starting round ${roundCount}`);
  log(`- Trump Card: ` + round.trump);

  // -- ESTIMATION PHASE --
  // TODO: encapsulate in game.js logic so that it can easily be used across different impleentations? Including dealeroffset
  //
  log(`- Estimation Phase`);

  // for(const player of estimationPhase(round)) { }

  for (const [playerIndex, player] of offsetArray(
    players,
    -dealerOffset,
  ).entries()) {
    let offsetPlayerIndex = offsetIndex(
      playerIndex,
      players.length,
      dealerOffset,
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

  // -- PLAY PHASE --
  log(`- Play Phase`);
  // Play until all hands in round are empty

  // TODO: abstract this logic? roundInProgress(round) ?
  // for(const player in playPhase(round) {}
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

  // -- SUMMARY PHASE --
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

export async function playGame(players, roundsToPlay) {
  if (!roundsToPlay) {
    roundsToPlay = Math.floor(60 / players.length);
  }
  const game = createNewGame();
  for (let i = 1; i <= roundsToPlay; i++) {
    let round = await playRound(i, players, (i - 1) % players.length);
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
    await playGame(players, 2);
  }
}

function log(...args) {
  if (process.env.NODE_ENV !== "test") {
    console.log(new Date().toLocaleTimeString(), "| game log:", ...args);
  }
}

function playerLog(...args) {
  if (process.env.NODE_ENV !== "test") {
    console.log(...args);
  }
}

init();
