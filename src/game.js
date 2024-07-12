/**
 * Start a new round, returns a new round state
 * @param {number} round Number of round (how many cards to deal per player)
 * @param {number} players Number of participating players
 */
export function createNewRound(round, players) {
  // Shuffle deck
  let deck = shuffleDeck(createDeck());

  // Initilize player hands
  let hands = [
    ...Array(players)
      .keys()
      .map(() => []),
  ];

  // Deal cards
  for (var i = 0; i < round * players; i++) {
    let [dealtCard, remainingCards] = dealCardFromDeck(deck);
    deck = remainingCards;
    hands[i % players].push(dealtCard);
  }

  // Create initial game state
  return {
    hands,
    tricks: [[]],
    trump: dealCardFromDeck(deck)[0],
  };
}

/**
 * Creates a range of cards with given suit
 * 2-10, J=11, Q=12, K=13, A=14
 * @param {string} suit
 * @returns {Array}
 */
function createCardRange(suit) {
  const lowCards = [];
  for (var i = 2; i < 15; i++) {
    lowCards.push(suit + i);
  }
  return lowCards;
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
    ...["L", "L", "L", "L"],
    // Snakes
    ...["S", "S", "S", "S"],
  ];
}

/**
 * Shuffle and return deck of highCards
 * @param {Array} deck
 * @returns {Array} deck
 */
export function shuffleDeck(deck) {
  return deck;
}

/**
 * Deal a card from top of deck
 * returns dealt card and remaining deck
 * @returns {Array} deck
 */
export function dealCardFromDeck(deck) {
  let dealtCard = deck.slice(0, 1)[0];
  let remainingCards = deck.slice(1);
  return [dealtCard, remainingCards];
}

/* Return index of winning card in a trick
 * @param {Array} trick
 * @returns {number} winner Index pointing to winning card in trick
 */
export function getTrickWinner(trick, suit) {
  let commandingSuit = suit === "L" ? trick[0][0] : suit;
  let winningCard = trick.reduce((prev, current) => {
    if (!prev) {
      return current;
    }

    /* Lizards always win */
    if (prev === "L") {
      return prev;
    }
    if (current === "L") {
      return current;
    }

    // Snakes never win? or do they...
    // Q: What happens if all cards are snakes?
    if (prev === "S") {
      return current;
    }
    if (current === "S") {
      return prev;
    }

    if (prev[0] === commandingSuit && current[0] !== commandingSuit) {
      return prev;
    }

    // High card wins
    return parseFloat(prev.slice(1)) > parseFloat(current.slice(1))
      ? prev
      : current;
  });
  return trick.indexOf(winningCard);
}

/**
 * is valid play?
 *
 * This functions validates if a card is eligble to
 * play given what the player has on hand and the
 * what cards are already in play in a trick
 * @param {string} card
 * @param {array} hand
 * @param {array} trick
 * @returns {bool} valid
 */
export function isValidPlay(card, hand, trick) {
  // First of all check player has card on hand
  if (!hand.includes(card)) {
    return false;
  }

  // Player can always play lizard
  if (card === "L") {
    return true;
  }

  // Player can always play snake
  if (card === "S") {
    return true;
  }

  // First card in trick dictates the suit that other
  // players must follow
  const commandingSuit = trick[0] ? trick[0][0] : null;

  if (commandingSuit) {
    // Does player have a card in suit?
    let hasSuitedCard = hand.some((card) => card[0][0] === commandingSuit);

    // If yes, check that card to be played follows suit
    if (hasSuitedCard && card[0][0] !== commandingSuit) {
      return false;
    }
  }
  return true;
}

/**
 * Play a card
 *
 * The function will figure out what player and what trick is in play
 * based on the card input & current state, and return a new state
 *
 * Will return an { error: "invalid play" } if an invalid play is made, altough
 * this should be made impossible via the game UI, but in case of a UI bug
 * or malicious user.
 *
 * @param {string} card Card to play eg. A7
 * @param {object} currentState Existing current state of game before play
 * @returns {object} state New state of game after car has been played
 */
export function playCard(card, currentState) {
  let tricks = currentState.tricks.slice(0);
  let hands = currentState.hands.slice(0);
  let currentTrick = tricks[tricks.length - 1];

  // Time for new trick?
  if (hands.length === currentTrick.length) {
    tricks.push([]);
    currentTrick = tricks[tricks.length - 1];
  }

  // Figure out whos turn it is
  let currentPlayerIndex;

  if (tricks.length > 1) {
    // We need to look at all previous tricks to get the winner of
    // the current trick
    let prevTrickWinner = tricks.reduceRight((prevTrickWinner, trick) => {
      if (trick[0] && trick[0][0] && trick.length == hands.length) {
        return getTrickWinner(trick, currentState.trump) + prevTrickWinner;
      } else {
        return prevTrickWinner;
      }
    }, 0);

    currentPlayerIndex = (prevTrickWinner + currentTrick.length) % hands.length;
  } else {
    currentPlayerIndex = currentTrick.length;
  }

  // is play valid?
  if (!isValidPlay(card, hands[currentPlayerIndex], currentTrick)) {
    return {
      error: "invalid play",
      currentPlayerIndex: currentPlayerIndex,
      hand: hands[currentPlayerIndex],
      card,
    };
  }

  // Finally make the play!
  currentTrick.push(card);
  currentTrick = [...currentTrick, card];
  hands[currentPlayerIndex] = hands[currentPlayerIndex].filter(
    (cardOnHand) => cardOnHand !== card,
  );

  return {
    ...currentState,
    hands,
    tricks,
  };
}
