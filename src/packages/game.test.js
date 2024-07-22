import assert from "node:assert";
import { describe, test } from "node:test";
import { roundTestFixture } from "./game.test.fixture.js";
import {
  createNewRound,
  playCard,
  createDeck,
  isValidEstimate,
  getTrickWinner,
  getTrickWinners,
  isValidPlay,
  calculateRoundScore,
  calculateGameScore,
} from "./game.js";

let mockPlayers = [{ name: "Frodo" }, { name: "Sam" }, { name: "Merry" }];

describe("calculate game score", () => {
  test("returns accumulated score of multiple rounds", async () => {
    let game = {
      rounds: [roundTestFixture, roundTestFixture],
    };
    let score = calculateGameScore(game);
    assert.deepStrictEqual(score, [-20, 60, 80]);
  });
});

describe("calculate round score", () => {
  test("returns accurate score", () => {
    let score = calculateRoundScore(roundTestFixture);
    assert.deepStrictEqual(score, [-10, 30, 40]);
  });

  test("returns accurate score with player wins more tricks than estimated", () => {
    let fixture = {
      ...roundTestFixture,
      playerEstimates: [0, 0, 0],
    };
    let score = calculateRoundScore(fixture);
    assert.deepStrictEqual(score, [-10, -10, -20]);
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

describe("create cards", () => {
  test("64 cards in a deck", () => {
    assert.strictEqual(createDeck().length, 60);
  });
});

describe("play round", () => {
  test("number of hands", () => {
    const newRound = createNewRound(3, mockPlayers);
    assert.strictEqual(newRound.moves[0].hands.length, 3);
  });

  test("number of dealt cards per hand", () => {
    const newRound = createNewRound(3, mockPlayers);
    assert.strictEqual(newRound.moves[0].hands[0].length, 3);
  });

  test("trump card", () => {
    const newRound = createNewRound(3, mockPlayers);
    assert.strictEqual(newRound.trump, "H11");
  });

  test("empty player estimates", () => {
    const newRound = createNewRound(3, mockPlayers);
    assert.deepStrictEqual(newRound.playerEstimates, []);
  });
});

describe("is valid play", () => {
  test("Player must have card on hand to play it", () => {
    assert.strictEqual(isValidPlay("H6", ["H5", "C6", "L"], []), false);
  });

  test("player can play any card in empty trick", () => {
    assert.strictEqual(isValidPlay("H5", ["H5", "C6", "L"], []), true);
  });

  test("player most follow suit", () => {
    assert.strictEqual(isValidPlay("H5", ["H5", "C6", "L"], ["C9"]), false);
    assert.strictEqual(isValidPlay("C6", ["H5", "C6", "L"], ["C9"]), true);
  });

  test("player can play any card if they cant follow suit", () => {
    assert.strictEqual(isValidPlay("H5", ["H5", "L"], ["C9"]), true);
  });

  test("player can break suit with lizard", () => {
    assert.strictEqual(isValidPlay("L", ["H5", "C6", "L"], ["C9"]), true);
  });

  test("player can break suit with snake", () => {
    assert.strictEqual(isValidPlay("S", ["H5", "C6", "S"], ["C9"]), true);
  });
});

describe("get trick winners", () => {
  test("should return the winners of each trick", () => {
    let trickWinners = getTrickWinners(roundTestFixture, true);
    assert.deepStrictEqual(trickWinners, [0, 2, 1, 2]);
  });
});

describe("get trick winner", () => {
  test("highest card wins", () => {
    assert.strictEqual(getTrickWinner(["H9", "H14", "H3", "H13"], "C"), 1);
  });

  test("highest card that follows suit wins", () => {
    assert.strictEqual(getTrickWinner(["H9", "C14", "H10", "C13"], "C"), 1);
  });

  test("when suit card is lizard, first card determines suit", () => {
    assert.strictEqual(getTrickWinner(["H9", "C14", "H10", "C13"], "L"), 2);
  });

  test("first lizard always wins", () => {
    assert.strictEqual(getTrickWinner(["C14", "L", "H10", "L"], "C"), 1);
  });

  test("first snake always loses", () => {
    assert.strictEqual(getTrickWinner(["S", "H2", "S", "S"], "C"), 1);
  });

  test("first snake wins if only snakes are played", () => {
    assert.strictEqual(getTrickWinner(["S", "S", "S"], "C"), 0);
  });

  test("first lizard wins if only lizards are played", () => {
    assert.strictEqual(getTrickWinner(["L", "L", "L"], "C"), 0);
  });

  test("suited card wins middle", () => {
    assert.strictEqual(getTrickWinner(["H2", "D3", "C10"], "D"), 1);
  });

  test("suited card wins when played last", () => {
    assert.strictEqual(getTrickWinner(["H7", "D13", "S5"], "S"), 2);
  });
});

describe("play card", () => {
  test("play invalid card", () => {
    assert.deepStrictEqual(
      playCard("D", { moves: [{ tricks: [], hands: [["A"], ["B"], ["C"]] }] })
        .error,
      "invalid play",
    );
  });

  test("play lizards and snakes", () => {
    assert.deepStrictEqual(
      playCard("S", {
        moves: [
          {
            hands: [
              ["S", "S"],
              ["L", "L"],
              ["S12", "L"],
            ],
            tricks: [],
          },
        ],
        players: mockPlayers,
      }).moves.at(-1),
      {
        hands: [["S"], ["L", "L"], ["S12", "L"]],
        tricks: [["S"]],
      },
    );
  });
});
