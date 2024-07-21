import { isValidPlay } from "./game.js";
import { getRandomInt } from "./util.js";
import readline from "readline";

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

class Player {
  constructor(name) {
    this.name = name;
  }
}

/* A bot player that just makes random decisions */
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

export class MockPlayer extends Player {
  async estimate() {
    return 1;
  }
  // Play first valid card
  async playCard(hand, trick) {
    return hand.find((card) => isValidPlay(card, hand, trick));
  }
}

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