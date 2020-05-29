function getCurrentSuit(cardsInPlay) {
  const card = cardsInPlay.find((card) => {
    return card.suit !== "snake" && card.suit !== "lizard";
  });
  if (card) {
    return card.suit;
  }
}

export function isCardPlayable(card, playableCards) {
  return playableCards.indexOf(card) !== -1;
}

export function getPlayableCards(cardsInPlay, cardsOnHand) {
  
  // If no card has been played any card is playable
  if (cardsInPlay.length === 0) {
    return cardsOnHand;
  }

  // What is the current suit in play?
  const currentSuit = getCurrentSuit(cardsInPlay);

  // Filter out what cards are playable
  return cardsOnHand.filter((card) => {
    // Can always play card in suit
    if (card.suit === currentSuit) {
      return true;
    }

    // Can always play lizard
    if (card.suit === "lizard") {
      return true;
    }

    // Can always play snake
    if (card.suit === "snake") {
      return true;
    }

    // May only play other card if not able to follow suit
    if (card.suit !== currentSuit) {
      if (
        cardsOnHand.filter((cardOnHand) => {
          if (cardOnHand.suit === currentSuit) {
            return true;
          }
        }).length === 0
      ) {
        return true;
      }
    }
  });
}
