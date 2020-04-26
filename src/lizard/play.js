export function getPlayableCards(cardInPlay, cardsOnHand) {
  const playableCards = cardsOnHand.filter((card) => {

    // Can always play card in suit
    if (card.suit === cardInPlay.suit) {
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
    if (card.suit !== cardInPlay.suit) {
      if (
        cardsOnHand.filter((cardOnHand) => {
          if(cardOnHand.suit === cardInPlay.suit) {
              return true;
          }
        }).length === 0
      ) {
        return true;
      }
    }
  });

  return playableCards;
}
