import { describe, test, before } from "node:test";
import assert from "node:assert";
import {
  createNewRound,
  createDeck,
  playCard,
  getTrickWinner,
  isValidPlay,
} from "./game.js";

describe("create cards", () => {
  test("64 cards in a deck", () => {
    assert.strictEqual(createDeck().length, 60);
  });
});

describe("new round", () => {
  test("number of hands", () => {
    const newRound = createNewRound(3, 5);
    assert.strictEqual(newRound.hands.length, 5);
  });

  test("number of dealt cards per hand", () => {
    const newRound = createNewRound(3, 5);
    assert.strictEqual(newRound.hands[0].length, 3);
  });

  test("trump card", () => {
    const newRound = createNewRound(3, 5);
    assert.strictEqual(newRound.trump, "C4");
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
});

// NOTE: These theses have been run in order
// as they rely on a mutating roundState
let roundState;
describe("play round", () => {
  before(() => {
    roundState = createNewRound(3, 3);
    console.log(roundState);
  });

  describe("first trick", () => {
    test("first play", () => {
      roundState = playCard("H2", roundState);
      assert.deepStrictEqual(roundState, {
        hands: [
          ["H5", "H8"],
          ["H3", "H6", "H9"],
          ["H4", "H7", "H10"],
        ],
        tricks: [["H2"]],
        trump: "H11",
      });
    });

    test("second play", () => {
      roundState = playCard("H9", roundState);
      assert.deepEqual(roundState, {
        hands: [
          ["H5", "H8"],
          ["H3", "H6"],
          ["H4", "H7", "H10"],
        ],
        tricks: [["H2", "H9"]],
        trump: "H11",
      });
    });

    test("third play", () => {
      roundState = playCard("H7", roundState);
      assert.deepEqual(roundState, {
        hands: [
          ["H5", "H8"],
          ["H3", "H6"],
          ["H4", "H10"],
        ],
        tricks: [["H2", "H9", "H7"]],
        trump: "H11",
      });
    });
  });

  describe("second trick", () => {
    test("first play", () => {
      roundState = playCard("H6", roundState);
      assert.deepEqual(roundState, {
        hands: [["H5", "H8"], ["H3"], ["H4", "H10"]],
        tricks: [["H2", "H9", "H7"], ["H6"]],
        trump: "H11",
      });
    });

    test("second play", () => {
      roundState = playCard("H10", roundState);
      assert.deepEqual(roundState, {
        hands: [["H5", "H8"], ["H3"], ["H4"]],
        tricks: [
          ["H2", "H9", "H7"],
          ["H6", "H10"],
        ],
        trump: "H11",
      });
    });

    test("third play", () => {
      roundState = playCard("H5", roundState);
      assert.deepEqual(roundState, {
        hands: [["H8"], ["H3"], ["H4"]],
        tricks: [
          ["H2", "H9", "H7"],
          ["H6", "H10", "H5"],
        ],
        trump: "H11",
      });
    });
  });

  describe("third trick", () => {
    test("first play", () => {
      roundState = playCard("H4", roundState);
      assert.deepEqual(roundState, {
        hands: [["H8"], ["H3"], []],
        tricks: [["H2", "H9", "H7"], ["H6", "H10", "H5"], ["H4"]],
        trump: "H11",
      });
    });

    test("second play", () => {
      roundState = playCard("H8", roundState);
      assert.deepEqual(roundState, {
        hands: [[], ["H3"], []],
        tricks: [
          ["H2", "H9", "H7"],
          ["H6", "H10", "H5"],
          ["H4", "H8"],
        ],
        trump: "H11",
      });
    });

    test("third play", () => {
      roundState = playCard("H3", roundState);
      assert.deepEqual(roundState, {
        hands: [[], [], []],
        tricks: [
          ["H2", "H9", "H7"],
          ["H6", "H10", "H5"],
          ["H4", "H8", "H3"],
        ],
        trump: "H11",
      });
    });
  });
});
