import assert from "node:assert";
import { describe, test } from "node:test";
import { MockPlayer } from "./player.js";
import {
  createNewRound,
  playRound,
  playCard,
  playGame,
  createDeck,
  isValidEstimate,
  getTrickWinner,
  isValidPlay,
} from "./game.js";

let mockPlayers = [
  new MockPlayer("Daniel"),
  new MockPlayer("Ruth"),
  new MockPlayer("Sara"),
];

describe("is valid estimate", () => {
  test("must be a valid number", () => {
    assert.strictEqual(isValidEstimate("x", 3), false);
  });

  test("less than number of rounds", () => {
    assert.strictEqual(isValidEstimate(5, 3), false);
  });

  test("less than zero", () => {
    assert.strictEqual(isValidEstimate(-1, 3), false);
  });

  test("valid estimate", () => {
    assert.strictEqual(isValidEstimate(3, 3), true);
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
    assert.strictEqual(newRound.trumpCard, "H11");
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
});

describe("play round", () => {
  test("three with three players", async () => {
    let result = await playRound(3, mockPlayers);
    assert.deepStrictEqual(result.moves.at(-1), {
      hands: [[], [], []],
      tricks: [
        ["H2", "H3", "H4"],
        ["H7", "H5", "H6"],
        ["H10", "H8", "H9"],
      ],
    });
  });
});

describe("play game", () => {
  test("three with three players", async () => {
    let result = await playGame(mockPlayers, 1);
    assert.deepStrictEqual(result.rounds[0].moves.at(-1), {
      hands: [[], [], []],
      tricks: [["H2", "H3", "H4"]],
    });
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
});
