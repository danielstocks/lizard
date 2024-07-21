import { shuffleArray } from "./util.js";

export function calculateGameScore(game) {
  return game.rounds.reduce(
    (acc, round) => {
      let roundScore = calculateRoundScore(round);
      return acc.map((score, i) => {
        return score + roundScore[i];
      });
    },
    [0, 0, 0],
  );
}

export function calculateRoundScore(round) {
  let winners = getAggregatePlayerWins(
    getTrickWinners(round),
    round.players.length,
  );
  return round.playerEstimates.map((estimate, i) => {
    let diff = winners[i] - estimate;
    if (diff == 0) {
      return 20 + estimate * 10;
    } else {
      return --diff * 10;
    }
  });
}

export function isValidEstimate(estimate, roundCount) {
  if (isNaN(estimate) || typeof estimate !== "number") {
    console.log("Estimate must be a valid number");
    return false;
  }
  if (estimate > roundCount) {
    console.log("Estimate cannot be larger than", roundCount);
    return false;
  }
  if (estimate < 0) {
    console.log("Estimate cannot be less than", 0);
    return false;
  }
  return true;
}

// Pass in a completed round and get what player won what trick
export function getTrickWinners(round) {
  let tricks = round.moves.at(-1).tricks;
  return tricks.reduce((acc, trick, i) => {
    let prevWinner = acc[i] || 0;
    let winner =
      (getTrickWinner(trick, round.trump) + prevWinner) % trick.length;
    return [...acc, winner];
  }, []);
}

// Takes an array of playerIndex winners eg. [0, 0, 1, 3, 3] and
// aggragtes into a new array counting wins per play eg. [2, 1, 0, 2]
export function getAggregatePlayerWins(trickWinners, numPlayers) {
  return trickWinners.reduce((acc, player) => {
    if (acc[player]) {
      acc[player] = acc[player] + 1;
    } else {
      acc[player] = 1;
    }
    return acc;
  }, new Array(numPlayers).fill(0));
}

// Return the index of the player whos turn it is
export function getCurrentPlayerIndex(round) {
  let tricks = round.moves.at(-1).tricks;
  let hands = round.moves.at(-1).hands;
  let currentTrick = tricks[tricks.length - 1] || [];

  let prevTrickWinner = tricks.reduceRight((prevTrickWinner, trick) => {
    if (trick[0] && trick[0][0] && trick.length == hands.length) {
      return getTrickWinner(trick, round.trump) + prevTrickWinner;
    } else {
      return prevTrickWinner;
    }
  }, 0);
  // Use some arithmetic to create a "circular" index accessed array
  return (prevTrickWinner + currentTrick.length) % hands.length;
}

/**
 * Start a new round, returns a new round state
 * @param {number} round Number of round (how many cards to deal per player)
 * @param {number} players Number of participating players
 * @returns {object} state Initial empty state of a round
 */
export function createNewRound(round, players) {
  // Shuffle deck
  let deck =
    process.env.NODE_ENV !== "test" ? shuffleArray(createDeck()) : createDeck();

  // Initilize player hands
  let hands = [
    ...Array(players.length)
      .keys()
      .map(() => []),
  ];

  // Deal cards
  for (var i = 0; i < round * players.length; i++) {
    let [dealtCard, remainingCards] = dealCardFromDeck(deck);
    deck = remainingCards;
    hands[i % players.length].push(dealtCard);
  }

  // Create initial game state
  return {
    moves: [
      {
        hands,
        tricks: [],
      },
    ],
    trumpCard: dealCardFromDeck(deck)[0],
    playerEstimates: [],
    players,
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
    /* Lizards always win */
    if (prev === "L") {
      return prev;
    }
    if (current === "L") {
      return current;
    }

    /* Snakes always lose */
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
  let tricks = currentState.moves.at(-1).tricks.slice(0);
  let hands = currentState.moves.at(-1).hands.slice(0);

  let currentTrick = tricks[tricks.length - 1];

  // Time for new trick?
  if (!currentTrick || hands.length === currentTrick.length) {
    tricks.push([]);
    currentTrick = tricks[tricks.length - 1];
    log(`-- Playing trick #${tricks.length}`);
  }

  let currentPlayerIndex = getCurrentPlayerIndex(currentState);
  let currentPlayerHand = hands[currentPlayerIndex];

  // is play valid?
  if (!isValidPlay(card, currentPlayerHand, currentTrick)) {
    return {
      error: "invalid play",
      currentPlayerIndex: currentPlayerIndex,
      hand: currentPlayerHand,
      currentTrick,
      card,
    };
  }

  // All good so far? Play the card!
  currentTrick.push(card);
  hands[currentPlayerIndex] = currentPlayerHand.toSpliced(
    currentPlayerHand.findIndex((cardOnHand) => cardOnHand === card),
    1,
  );

  log(
    `--- Player ${currentState.players[currentPlayerIndex].name} plays ${card}`,
  );

  // End of trick - Log winner
  if (hands.length === currentTrick.length) {
    let thisTrickWinner = tricks.reduceRight((prevTrickWinner, trick) => {
      return getTrickWinner(trick, currentState.trump) + prevTrickWinner;
    }, 0);
    let playerName = currentState.players[thisTrickWinner % hands.length].name;
    log(`--- Winner: ${playerName}`);
  }

  return {
    ...currentState,
    moves: [...currentState.moves, { hands, tricks }],
  };
}

/* c8 ignore start */
function log(...args) {
  if (process.env.NODE_ENV !== "test") {
    console.log(new Date().toLocaleTimeString(), "| game log:", ...args);
  }
}
/* c8 ignore end */