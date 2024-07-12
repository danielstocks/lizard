/* 

TODO: Start a new game:

{
  log: [
    timestamp: "2024-07-12T12:33:42.320Z"
    message: "Game started"
  ]
  players: [
    { name: "Daniel", type: "human", playCard(), estimate()}
    { name: "Bot 1", type: "bot", playCard(), estimate()}
    { name: "Bot 2", type": bot", playCard(), estimate()}
  ,],
  startingPlayerIndex: 0
  rounds: [
    {
      trump: "C9",
      playerEstimates: [1, 0, 1]
      // Adds a new entry for every move for undo/redo/replay
      moves: [{
        hands: [],
        tricks: []
      }],
    },
  ]
}

---
5. ask/await for playCard
6. continue until all cards have been played (check for empty hands)
---
*/

export function playRound(roundCount, players) {
  let round = createNewRound(roundCount, players);
  log(`Starting round ${roundCount} --`);

  log(`- Estimation Phase`);
  // TODO: Prison rules?
  round.playerEstimates = players.map((player, i) => {
    let estimate = player.estimate();
    log(
      `-- ${player.name} thinks they can win ${estimate} trick${estimate !== 1 ? "s" : ""}`,
    );
    return player.estimate(round.moves[0].hands[i]);
  });

  log(`- Play Phase`);

  return round;
}

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

  // To find whos turn it is we need to look at
  // all tricks to deduce know who won last trick
  let prevTrickWinner = tricks.reduceRight((prevTrickWinner, trick) => {
    if (trick[0] && trick[0][0] && trick.length == hands.length) {
      return getTrickWinner(trick, currentState.trump) + prevTrickWinner;
    } else {
      return prevTrickWinner;
    }
  }, 0);

  // Use som arithmetic to create a "circular" index accessed array
  let currentPlayerIndex =
    (prevTrickWinner + currentTrick.length) % hands.length;

  // is play valid?
  if (!isValidPlay(card, hands[currentPlayerIndex], currentTrick)) {
    return {
      error: "invalid play",
      currentPlayerIndex: currentPlayerIndex,
      hand: hands[currentPlayerIndex],
      card,
    };
  }

  // All good so far? Play the card!
  currentTrick.push(card);
  hands[currentPlayerIndex] = hands[currentPlayerIndex].filter(
    (cardOnHand) => cardOnHand !== card,
  );

  log(
    `--- Player ${currentState.players[currentPlayerIndex].name} plays ${card}`,
  );

  // End of trick - Log winner
  if (hands.length === currentTrick.length) {
    let thisTrickWinner = tricks.reduceRight((prevTrickWinner, trick) => {
      return getTrickWinner(trick, currentState.trump) + prevTrickWinner;
    }, 0);

    log(
      `--- Winner: ${currentState.players[thisTrickWinner % hands.length].name}`,
    );
  }

  return {
    ...currentState,
    moves: [...currentState.moves, { hands, tricks }],
  };
}

function log(msg) {
  console.log(new Date().toLocaleTimeString(), "| game log:", msg);
}
