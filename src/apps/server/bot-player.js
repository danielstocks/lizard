import { isValidPlay } from "../../packages/game.js";
import { getRandomInt } from "../../packages/util.js";

// Base class for a player
class Player {
  constructor(name, id) {
    this.name = name;
    this.id = id;
    this.type = "bot";
  }
}

// A "bot" player that just makes random decisions
export class RandomBotPlayer extends Player {
  // Get random etimate
  estimate(hand) {
    return getRandomInt(0, hand.length);
  }

  // Play random card
  playCard(hand, trick) {
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
  estimate() {
    return 1;
  }
  // Always play first valid card on hand
  playCard(hand, trick) {
    return hand.find((card) => isValidPlay(card, hand, trick));
  }
}
