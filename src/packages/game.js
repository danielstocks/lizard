import {
  shuffleArray,
  offsetIndex,
  createDeck,
  dealCardFromDeck,
} from "./util.js";

/**
 * Create and return new game state
 * @param {number} numberOfPlayers of players to participate in game
 * @param {number} [roundsToPlay] optionally specify number of rounds to play
 * @returns {object} game
 */
export function createGame(numberOfPlayers, roundsToPlay) {
  if (isNaN(numberOfPlayers) || numberOfPlayers > 5 || numberOfPlayers < 3) {
    throw new Error("Number of players must be between 3 and 5");
  }
  if (!roundsToPlay) {
    roundsToPlay = Math.floor(60 / numberOfPlayers);
  }
  return {
    rounds: [],
    numberOfPlayers,
    roundsToPlay,
  };
}

/**
 * Create and return new round state
 * @param {number} roundNumber Number of current round (how many cards to deal per player)
 * @param {number} numberOfPlayers Number of participating players in round
 * @returns {object} state Initial empty state of a round
 */
export function createRound(roundNumber, numberOfPlayers) {
  if (isNaN(roundNumber) || roundNumber > 20 || roundNumber < 1) {
    throw new Error("Round number must be between 1 and 20");
  }

  // Rotate dealer positon
  const dealerOffset = (roundNumber - 1) % numberOfPlayers;

  // Shuffle deck
  let deck =
    process.env.NODE_ENV !== "test" ? shuffleArray(createDeck()) : createDeck();

  // Initilize player hands
  const hands = new Array(numberOfPlayers).fill(null).map(() => []);

  // Deal cards
  for (var i = 0; i < roundNumber * numberOfPlayers; i++) {
    let [dealtCard, remainingCards] = dealCardFromDeck(deck);
    deck = remainingCards;
    hands[(i + dealerOffset) % numberOfPlayers].push(dealtCard);
  }

  // Create initial game state
  return {
    moves: [
      {
        hands,
        tricks: [],
      },
    ],
    trump: dealCardFromDeck(deck)[0],
    dealerOffset,
    playerEstimates: new Array(numberOfPlayers).fill(undefined),
    numberOfPlayers,
  };
}

/**
 * Create a new game and persist game state in memory store
 * @param {object} round
 */
export function getRoundPhase(round) {
  // A round is in estimation phase if we're still awaing player estimates
  if (
    round.playerEstimates.some(
      /** @param {number} estimate */
      (estimate) => typeof estimate === "undefined",
    )
  ) {
    return "ESTIMATION";
  }

  // A round is complete when all cards have been played
  if (round.moves.at(-1).hands.flat().length > 0) {
    return "PLAY";
  }

  // Otherwise a round is done
  return "DONE";
}

/**
 * Return hand of player given current round state
 * player index is offset by round dealer offset
 * @param {object} round Current state of round
 * @param {number} playerIndex Index of player to get hand from
 * @returns {array} hand Array of cards
 */
export function getOffsetPlayerHand(round, playerIndex) {
  let hands = round.moves.at(-1).hands;
  let offsetPlayerIndex = offsetIndex(
    playerIndex,
    hands.length,
    round.dealerOffset,
  );
  return hands[offsetPlayerIndex];
}

/**
 * Checks wether given player estimate is valid
 * @param {number} estimate
 * @param {number} roundCount
 * @returns {[boolean, (string|undefined)]}
 */
export function isValidEstimate(estimate, roundCount) {
  if (isNaN(estimate) || typeof estimate !== "number") {
    return [false, "Estimate must be a valid number"];
  }
  if (estimate > roundCount) {
    return [false, "Estimate cannot be larger than " + roundCount];
  }
  if (estimate < 0) {
    return [false, "Estimate cannot be less than 0"];
  }
  return [true, undefined];
}

/**
 * Return index of winning card in a trick
 * @param {Array} trick
 * @param {string} trump
 * @returns {number} winner Index pointing to winning card in trick
 */
export function getWinningCardIndex(trick, trump) {
  // If trump card is lizard or snake or undefine,
  // the first card in the trick determines
  // the commanding suite instead
  let commandingSuit = ["LIZARD", "SNAKE", undefined].includes(trump)
    ? trick[0][0]
    : trump[0];

  let winningCard = trick.reduce((prev, current) => {
    /* Lizards always win :) */
    if (prev === "LIZARD") {
      return prev;
    }
    if (current === "LIZARD") {
      return current;
    }

    /* Snakes always lose :( */
    if (prev === "SNAKE") {
      return current;
    }
    if (current === "SNAKE") {
      return prev;
    }

    if (prev[0] === commandingSuit && current[0] !== commandingSuit) {
      return prev;
    }

    if (prev[0] !== commandingSuit && current[0] === commandingSuit) {
      return current;
    }

    // Only cards that follow suit at this point can win
    if (prev[0] !== current[0]) {
      return prev;
    }

    // Finally: High card wins
    return parseFloat(prev.slice(1)) > parseFloat(current.slice(1))
      ? prev
      : current;
  });

  return trick.indexOf(winningCard);
}

/**
 * Return the index of the player whos turn it is to play a card
 * @param {object} round current state of round
 * @returns {number} player index
 */
export function getCurrentPlayerIndex(round) {
  let tricks = round.moves.at(-1).tricks;
  let hands = round.moves.at(-1).hands;
  let currentTrick = tricks[tricks.length - 1] || [];
  let prevTrickWinner = tricks.reduceRight((prevTrickWinner, trick) => {
    if (trick[0] && trick[0][0] && trick.length == hands.length) {
      return getWinningCardIndex(trick, round.trump) + prevTrickWinner;
    } else {
      return prevTrickWinner;
    }
  }, 0);
  // Use some arithmetic to create a "circular" index accessed array
  return (
    (round.dealerOffset + prevTrickWinner + currentTrick.length) % hands.length
  );
}

/**
 * Pass in a round and get the playerIndex of each trick winner
 * @param {object} round current state of round
 * @returns {Array} player index of winner of each trick
 */
export function getTrickWinners(round) {
  let tricks = round.moves.at(-1).tricks;
  let hands = round.moves.at(-1).hands;
  return tricks.reduce((acc, trick, i) => {
    let prevWinner = i > 0 ? acc.at(-1) : round.dealerOffset;
    let winner =
      (prevWinner + getWinningCardIndex(trick, round.trump)) % hands.length;
    return [...acc, winner];
  }, []);
}

/**
 * Calculate scores of a finished round based on trick wins vs
 * actual player estimate
 * @param {object} round current state of round
 * @returns {Array} round score for each player
 */
export function calculateRoundScore(round) {
  let winners = getAggregatePlayerWins(
    getTrickWinners(round),
    round.numberOfPlayers,
  );

  return round.playerEstimates.map((estimate, i) => {
    let diff = Math.abs(winners[i] - estimate);
    if (diff == 0) {
      return 20 + estimate * 10;
    } else {
      return diff * -10;
    }
  });
}

/**
 * Takes an array of playerIndex winners eg. [0, 0, 1, 3, 3] and
 * aggragtes into a new array counting wins per play eg. [2, 1, 0, 2]
 * @param {Array} trickWinners array of winners
 * @param {number} numberOfPlayers number of players in game
 * @returns {Array} aggregated wins per player index
 */
export function getAggregatePlayerWins(trickWinners, numberOfPlayers) {
  return trickWinners.reduce((acc, player) => {
    if (acc[player]) {
      acc[player] = acc[player] + 1;
    } else {
      acc[player] = 1;
    }
    return acc;
  }, new Array(numberOfPlayers).fill(0));
}

/**
 * Calculate scores of a finished game based on round wins
 * @param {object} game current state of round
 * @returns {Array} total score
 */
export function calculateGameScore(game) {
  return game.rounds.reduce((acc, round) => {
    let roundScore = calculateRoundScore(round);
    return acc.map((score, i) => {
      return score + roundScore[i];
    });
  }, new Array(game.numberOfPlayers).fill(0));
}

/**
 * is valid play?
 *
 * This functions validates if a card is eligble to
 * play given what the player has on hand and the
 * what cards are already in play in a trick
 * @param {string} card
 * @param {array} hand
 * @param {array} trick
 * @returns {boolean} valid
 */
export function isValidPlay(card, hand, trick) {
  // First of all check player has card on hand
  if (!hand.includes(card)) {
    return false;
  }

  // Player can always play lizard
  if (card === "LIZARD") {
    return true;
  }

  // Player can always play snake
  if (card === "SNAKE") {
    return true;
  }

  // Any card can be played if commanding suit is LIZARD or SNAKE
  if (trick[0] && ["LIZARD", "SNAKE"].includes(trick[0])) {
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
 * @param {object} round Existing current state of round before play
 * @returns {object} round New state of round after car has been played
 */
export function playCard(card, round) {
  let tricks = round.moves.at(-1).tricks.slice(0);
  let hands = round.moves.at(-1).hands.slice(0);

  let currentTrick = tricks[tricks.length - 1];

  // Time for new trick?
  if (!currentTrick || hands.length === currentTrick.length) {
    tricks.push([]);
    currentTrick = tricks[tricks.length - 1];
  }

  let currentPlayerIndex = getCurrentPlayerIndex(round);
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

  return {
    ...round,
    moves: [...round.moves, { hands, tricks }],
  };
}
