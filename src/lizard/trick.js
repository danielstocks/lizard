function getCardValue(card) {
  if (card.value === "J") return 11;
  if (card.value === "Q") return 12;
  if (card.value === "K") return 13;
  if (card.value === "A") return 14;
  return parseInt(card.value);
}

export function getWinningCard(cards, trumpSuit) {
  let winningCard;

  cards.forEach((card) => {
    // First card played is initially winning :)
    if (!winningCard) {
      winningCard = card;
      return;
    }

    // First lizard wins
    if (card.suit === "lizard" && winningCard.suit !== "lizard") {
      winningCard = card;
      return;
    }

    // Trump card wins
    if (card.suit == trumpSuit && winningCard.suit !== trumpSuit) {
      winningCard = card;
      return;
    }

    // Highest Trump card wins
    if (card.suit == trumpSuit && winningCard.suit == trumpSuit) {
      if (getCardValue(card) > getCardValue(winningCard)) {
        winningCard = card;
      }
      return;
    }

    // Highest card in suit wins
    if (
      card.suit === winningCard.suit &&
      getCardValue(card) > getCardValue(winningCard)
    ) {
      winningCard = card;
      return;
    }

    // Snake never wins, unless snakes everywhere
    if (winningCard.suit === "snake") {
      if (card.suit !== "snake") {
        winningCard = card;
      }
      return;
    }
  });

  return winningCard;
}
