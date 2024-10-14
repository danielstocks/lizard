// @ts-check

/**
 * Copies and shuffles an array
 * based on the Fisher–Yates sorting algorithm
 * @param {array} array
 */
export function shuffleArray(array) {
  let newArray = array.slice(0);
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * @param {number} min
 * @param {number} max
 */
export function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Use to pluralize english words
 * Return 's' if count is not 1
 * @param {number} count
 */
export function pluralize(count) {
  return count !== 1 ? "s" : "";
}

/**
 * Offset Index
 * Takes an index (eg. 5) and offsets it with offset (eg. 3)
 * If the sum (8) exceeeds the length (eg. 6) then it should
 * start over at 0, in this case the returned value will be 2
 * @param {number} index
 * @param {number} length
 * @param {number} offset
 */
export function offsetIndex(index, length, offset) {
  // TODO: just kill this function later, needless abstraction?
  let sum = index + offset;
  if (sum < length) {
    return sum;
  } else {
    return sum % length;
  }
}

/**
 * Offset Array
 * @param {array} array
 * @param {number} offset
 */
export function offsetArray(array, offset) {
  let copy = array.slice(0);
  const length = copy.length;
  copy.push(...copy.splice(0, ((-offset % length) + length) % length));
  return copy;
}

/**
 * Creates a range of cards with given suit
 * 2-10, J=11, Q=12, K=13, A=14
 * @param {string} suit
 * @returns {Array}
 */
export function createCardRange(suit) {
  const cards = [];
  for (var i = 2; i < 11; i++) {
    cards.push(suit + i);
  }
  cards.push(suit + "J");
  cards.push(suit + "Q");
  cards.push(suit + "K");
  cards.push(suit + "A");
  return cards;
}

/**
 * Create a new deck of cards to use in a game
 * @returns {Array}
 */
export function createDeck() {
  return [
    // Hearts
    ...createCardRange("H"),
    // Clubs
    ...createCardRange("C"),
    // Spades
    ...createCardRange("S"),
    // Diamonds
    ...createCardRange("D"),
    // Lizards
    ...Array(4).fill("LIZARD"),
    // Snakes
    ...Array(4).fill("SNAKE"),
  ];
}

/**
 * Deal a card from top of deck
 * returns dealt card and remaining deck
 * @param {Array} deck
 * @returns {[string, string[]]}
 */
export function dealCardFromDeck(deck) {
  let dealtCard = deck.slice(0, 1)[0];
  let remainingCards = deck.slice(1);
  return [dealtCard, remainingCards];
}
