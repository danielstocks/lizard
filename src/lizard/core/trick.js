function getCardValue(card) {
  if (card.value === "J") return 11;
  if (card.value === "Q") return 12;
  if (card.value === "K") return 13;
  if (card.value === "A") return 14;
  return parseInt(card.value);
}

// Rename to getWinningPlay?
export function getWinningPlay(plays, trumpSuit) {
  let winningPlay;

  plays.forEach((play) => {
    const card = play.card;

    // First card played is initially winning :)
    if (!winningPlay) {
      winningPlay = play;
      return;
    }

    // First lizard wins
    if (card.suit === "lizard" && winningPlay.card.suit !== "lizard") {
      winningPlay = play;
      return;
    }

    // Trump card wins
    if (card.suit == trumpSuit && winningPlay.card.suit !== trumpSuit) {
      winningPlay = play;
      return;
    }

    // Highest Trump card wins
    if (card.suit == trumpSuit && winningPlay.card.suit == trumpSuit) {
      if (getCardValue(card) > getCardValue(winningPlay.card)) {
        winningPlay = play;
      }
      return;
    }

    // Highest card in suit wins
    if (
      winningPlay.card &&
      card.suit === winningPlay.card.suit &&
      getCardValue(card) > getCardValue(winningPlay.card)
    ) {
      winningPlay = play;
      return;
    }

    // Snake never wins, unless snakes everywhere
    if (winningPlay.card && winningPlay.card.suit === "snake") {
      if (card.suit !== "snake") {
        winningPlay = play;
      }
      return;
    }
  });

  return winningPlay;
}
