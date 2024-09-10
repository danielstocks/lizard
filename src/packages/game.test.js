import assert from "node:assert";
import { describe, test } from "node:test";
import {
  createRound,
  isValidEstimate,
  getWinningCardIndex,
  createGame,
  getOffsetPlayerHand,
  getTrickWinners,
  playCard,
  isValidPlay,
  calculateRoundScore,
  calculateGameScore,
  getCurrentPlayerIndex,
} from "./game.js";

describe("createGame", () => {
  test("requires players", () => {
    assert.throws(() => {
      createGame();
    }, Error);
  });

  test("requires min 3 players", () => {
    assert.throws(() => {
      createGame([{ name: "Pippin" }]);
    }, Error);
  });

  test("creates game", () => {
    const game = createGame(3);
    assert.deepStrictEqual(game, {
      rounds: [],
      numberOfPlayers: 3,
      roundsToPlay: 20,
    });
  });
});

describe("createRound", () => {
  test("create a round", () => {
    const round = createRound(1, 3);
    assert.deepStrictEqual(round, {
      moves: [
        {
          hands: [["H2"], ["H3"], ["H4"]],
          tricks: [],
        },
      ],
      trump: "H5",
      dealerOffset: 0,
      playerEstimates: [],
      numberOfPlayers: 3,
    });
  });

  test("rotate dealer position", () => {
    const round1 = createRound(1, 3);
    const round2 = createRound(2, 3);
    const round3 = createRound(3, 3);
    const round4 = createRound(4, 3);
    const round5 = createRound(5, 3);
    assert.strictEqual(round1.dealerOffset, 0);
    assert.strictEqual(round2.dealerOffset, 1);
    assert.strictEqual(round3.dealerOffset, 2);
    assert.strictEqual(round4.dealerOffset, 0);
    assert.strictEqual(round5.dealerOffset, 1);
    assert.deepStrictEqual(round1.moves[0].hands, [["H2"], ["H3"], ["H4"]]);
    assert.deepStrictEqual(round2.moves[0].hands, [
      ["H4", "H7"],
      ["H2", "H5"],
      ["H3", "H6"],
    ]);
    assert.deepStrictEqual(round3.moves[0].hands, [
      ["H3", "H6", "H9"],
      ["H4", "H7", "H10"],
      ["H2", "H5", "H8"],
    ]);
    assert.deepStrictEqual(round4.moves[0].hands, [
      ["H2", "H5", "H8", "H11"],
      ["H3", "H6", "H9", "H12"],
      ["H4", "H7", "H10", "H13"],
    ]);
    assert.deepStrictEqual(round5.moves[0].hands, [
      ["H4", "H7", "H10", "H13", "C3"],
      ["H2", "H5", "H8", "H11", "H14"],
      ["H3", "H6", "H9", "H12", "C2"],
    ]);
  });

  test("trump card is undefined if all cards have been dealt (last round)", () => {
    const round20 = createRound(20, 3);
    assert.strictEqual(round20.trump, undefined);
  });
});

describe("get offset player hand", () => {
  test("first player, first round", () => {
    const round1 = createRound(1, 3);
    const hand = getOffsetPlayerHand(round1, 0);
    assert.deepStrictEqual(hand, ["H2"]);
  });

  test("first player, second round", () => {
    const round2 = createRound(2, 3);
    const hand = getOffsetPlayerHand(round2, 0);
    assert.deepStrictEqual(hand, ["H2", "H5"]);
  });

  test("third player, second round", () => {
    const round2 = createRound(2, 3);
    const hand = getOffsetPlayerHand(round2, 2);
    assert.deepStrictEqual(hand, ["H4", "H7"]);
  });
});

describe("is valid estimate", () => {
  test("must be a valid number", () => {
    assert.strictEqual(isValidEstimate("x", 3)[0], false);
  });

  test("less than number of rounds", () => {
    assert.strictEqual(isValidEstimate(5, 3)[0], false);
  });
  test("less than zero", () => {
    assert.strictEqual(isValidEstimate(-1, 3)[0], false);
  });

  test("valid estimate", () => {
    assert.strictEqual(isValidEstimate(3, 3)[0], true);
  });
});

describe("get winning card index", () => {
  test("comanding suit highest card wins", () => {
    assert.strictEqual(getWinningCardIndex(["H5", "S8", "S7"], "D"), 0);
  });

  test("highest card wins", () => {
    assert.strictEqual(getWinningCardIndex(["H9", "H14", "H3", "H13"], "C"), 1);
  });

  test("highest card that follows trump wins", () => {
    assert.strictEqual(
      getWinningCardIndex(["H9", "C14", "H10", "C13"], "C"),
      1,
    );
  });

  test("highest card that follows trump wins even when last", () => {
    assert.strictEqual(getWinningCardIndex(["H7", "D13", "S5"], "S"), 2);
  });

  test("first lizard always wins", () => {
    assert.strictEqual(
      getWinningCardIndex(["C14", "LIZARD", "H10", "LIZARD"], "C"),
      1,
    );
  });

  test("first snake always loses", () => {
    assert.strictEqual(
      getWinningCardIndex(["SNAKE", "H2", "SNAKE", "SNAKE"], "C"),
      1,
    );
  });

  test("first snake wins if only snakes are played", () => {
    assert.strictEqual(
      getWinningCardIndex(["SNAKE", "SNAKE", "SNAKE"], "C"),
      0,
    );
  });

  test("first lizard wins if only lizards are played", () => {
    assert.strictEqual(
      getWinningCardIndex(["LIZARD", "LIZARD", "LIZARD"], "C"),
      0,
    );
  });

  test("when trump card is lizard, first card determines trump", () => {
    assert.strictEqual(
      getWinningCardIndex(["H9", "C14", "H10", "C13"], "LIZARD"),
      2,
    );
  });

  test("when trump card is snake, first card determines trump", () => {
    assert.strictEqual(
      getWinningCardIndex(["H9", "C14", "H10", "C13"], "SNAKE"),
      2,
    );
  });

  test("when trump card is undefined, first card determines trump", () => {
    assert.strictEqual(
      getWinningCardIndex(["H9", "C14", "H10", "C13"], undefined),
      2,
    );
  });
});

describe("get current player index", () => {
  test("first round, first trick", () => {
    const round = createRound(1, 3);
    assert.equal(getCurrentPlayerIndex(round), 0);
  });

  test("play third round", () => {
    let round = createRound(3, 3);

    // Initial state
    assert.strictEqual(getCurrentPlayerIndex(round), 2);

    // Play first trick
    round = playCard("H2", round);
    round = playCard("H3", round);
    round = playCard("H4", round);
    assert.strictEqual(getCurrentPlayerIndex(round), 1);

    // Play second trick
    round = playCard("H7", round);
    round = playCard("H8", round);
    round = playCard("H9", round);
    assert.equal(getCurrentPlayerIndex(round), 0);

    // Play third trick
    round = playCard("H6", round);
    round = playCard("H10", round);
    round = playCard("H5", round);
    assert.equal(getCurrentPlayerIndex(round), 1);
  });
});

describe("get trick winners", () => {
  test("should return the winners of each trick", () => {
    let round = createRound(3, 3);

    // Play first trick
    round = playCard("H2", round);
    round = playCard("H3", round);
    round = playCard("H4", round);

    // Play second trick
    round = playCard("H7", round);
    round = playCard("H8", round);
    round = playCard("H9", round);

    // Play third trick
    round = playCard("H6", round);
    round = playCard("H10", round);
    round = playCard("H5", round);

    let trickWinners = getTrickWinners(round);
    assert.deepStrictEqual(trickWinners, [1, 0, 1]);
  });
});

describe("get aggregate playerWins", () => {
  // TODO: test getAggregatePlayerWins
});

describe("calculate round score", () => {
  test("returns accurate score", () => {
    let round = createRound(3, 3);
    round.playerEstimates = [2, 2, 0];

    // Play first trick
    round = playCard("H2", round);
    round = playCard("H3", round);
    round = playCard("H4", round);

    // Play second trick
    round = playCard("H7", round);
    round = playCard("H8", round);
    round = playCard("H9", round);

    // Play third trick
    round = playCard("H6", round);
    round = playCard("H10", round);
    round = playCard("H5", round);

    let score = calculateRoundScore(round);
    assert.deepStrictEqual(score, [-10, 40, 20]);
  });
});

describe("calculate game score", () => {
  test("it calculates game score", () => {
    let game = createGame(3);

    // Setup first round
    let round1 = createRound(1, 3);
    round1.playerEstimates = [1, 0, 1];

    // Play first round, first trick
    round1 = playCard("H2", round1);
    round1 = playCard("H3", round1);
    round1 = playCard("H4", round1);
    game.rounds.push(round1);

    // Score after first round
    let partialScore = calculateGameScore(game);
    assert.deepStrictEqual(partialScore, [-10, 20, 30]);

    // Setup second round
    let round2 = createRound(2, 3);
    round2.playerEstimates = [2, 1, 0];

    // Play second round, first trick
    round2 = playCard("H2", round2);
    round2 = playCard("H3", round2);
    round2 = playCard("H4", round2);

    // Play second round, second trick
    round2 = playCard("H7", round2);
    round2 = playCard("H5", round2);
    round2 = playCard("H6", round2);

    game.rounds.push(round2);

    // Calculate final game score
    let score = calculateGameScore(game);
    assert.deepStrictEqual(score, [30, 10, 50]);
  });
});

describe("is valid play", () => {
  test("Player must have card on hand to play it", () => {
    assert.strictEqual(isValidPlay("H6", ["H5", "C6", "LIZARD"], []), false);
  });

  test("player can play any card in empty trick", () => {
    assert.strictEqual(isValidPlay("H5", ["H5", "C6", "LIZARD"], []), true);
  });

  test("player most follow suit", () => {
    assert.strictEqual(
      isValidPlay("H5", ["H5", "C6", "LIZARD"], ["C9"]),
      false,
    );
    assert.strictEqual(isValidPlay("C6", ["H5", "C6", "LIZARD"], ["C9"]), true);
  });

  test("player can play any card if they cant follow suit", () => {
    assert.strictEqual(isValidPlay("H5", ["H5", "LIZARD"], ["C9"]), true);
  });

  test("player can break suit with lizard", () => {
    assert.strictEqual(
      isValidPlay("LIZARD", ["H5", "C6", "LIZARD"], ["C9"]),
      true,
    );
  });

  test("player can break suit with snake", () => {
    assert.strictEqual(
      isValidPlay("SNAKE", ["H5", "C6", "SNAKE"], ["C9"]),
      true,
    );
  });

  test("player can play any card if first card in trick is lizard", () => {
    assert.strictEqual(
      isValidPlay("H5", ["H5", "C6", "LIZARD"], ["LIZARD"]),
      true,
    );
  });

  test("player can play any card first card in trick is snake", () => {
    assert.strictEqual(
      isValidPlay("H5", ["H5", "C6", "SNAKE"], ["SNAKE"]),
      true,
    );
  });
});

describe("play card", () => {
  test("play invalid card", () => {
    assert.deepStrictEqual(
      playCard("D", {
        moves: [{ tricks: [], hands: [["A"], ["B"], ["C"]] }],
        dealerOffset: 0,
      }).error,
      "invalid play",
    );
  });

  test("play lizards and snakes", () => {
    assert.deepStrictEqual(
      playCard("SNAKE", {
        moves: [
          {
            hands: [
              ["SNAKE", "SNAKE"],
              ["LIZARD", "LIZARD"],
              ["S12", "LIZARD"],
            ],
            tricks: [],
          },
        ],
        dealerOffset: 0,
        numberOfPlayers: 3,
      }).moves.at(-1),
      {
        hands: [["SNAKE"], ["LIZARD", "LIZARD"], ["S12", "LIZARD"]],
        tricks: [["SNAKE"]],
      },
    );
  });
});
