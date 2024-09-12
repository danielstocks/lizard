import readline from "readline";
import { isValidPlay, isValidEstimate } from "../../packages/game.js";
import { getRandomInt } from "../../packages/util.js";
import { playerLog } from "./log.js";

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
  // Get random estimate
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

    let message;
    let validEstimate;
    let input;

    do {
      input = await userInput("How many tricks do you think you can win?\n=> ");
      input = parseFloat(input);
      [validEstimate, message] = isValidEstimate(input, hand.length);
      if (message) {
        playerLog(message);
      }
    } while (!validEstimate);

    return input;
  }
  async playCard(hand, trick) {
    playerLog("\nOn the table:", trick);
    playerLog("Your hand:", hand);
    return await userInput("What card do you want to play?\n=> ");
  }
}
