var suits = ["spades", "diamonds", "clubs", "hearts"];
var values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

export const suitSymbols = {
  spades: "♠️",
  diamonds: "♦️",
  hearts: "♥️",
  clubs: "♣️",
  lizard: "🦎",
  snake: "🐍",
};

export function cardToString(card) {
  return suitSymbols[card.suit] + card.value
}

/* 
Use boardgame.io internal ctx.random.Shuffle once
this bug is fixed: https://github.com/nicolodavis/boardgame.io/issues/588
*/
export function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

export function createDeck() {
  var deck = new Array();
  for (var i = 0; i < suits.length; i++) {
    for (var x = 0; x < values.length; x++) {
      var card = { value: values[x], suit: suits[i] };
      deck.push(card);
    }
  }
  return deck;
}

export function addSpecialCards() {
  const four = Array.from(Array(4).keys());
  return [
    ...four.map((x, i) => ({
      value: i,
      suit: "lizard",
    })),
    ...four.map((x, i) => ({
      value: i,
      suit: "snake",
    })),
  ];
}
