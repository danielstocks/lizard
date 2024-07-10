import { describe, test } from "node:test";
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
    let newRound = createNewRound(3, 5);
    assert.strictEqual(newRound.hands.length, 5);
  });

  test("number of dealt cards per hand", () => {
    let newRound = createNewRound(3, 5);
    assert.strictEqual(newRound.hands[0].length, 3);
  });
});

describe("is valid play", () => {
  test("player can play any card in empty trick", () => {
    assert.strictEqual(isValidPlay("H5", ["H5", "C6", "L"], []), true);
  });

  test("player most follow suit", () => {
    assert.strictEqual(isValidPlay("H5", ["H5", "C6", "L"], ["C9"]), false);
    assert.strictEqual(isValidPlay("C6", ["H5", "C6", "L"], ["C9"]), true);
  });

  // TODO: continue here
  test.todo("player can play any card if they cant follow suit");

  test.todo("player can break suit with lizard");

  test.todo("player can break suit with snake");
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

describe("play card", () => {
  describe("first trick", () => {
    test("first play", () => {
      let currentState = {
        hands: [
          ["H5", "H8", "H2"],
          ["H3", "H6", "H9"],
          ["H4", "H7", "H10"],
        ],
        tricks: [[]],
      };
      assert.deepEqual(playCard("H2", currentState), {
        hands: [
          ["H5", "H8"],
          ["H3", "H6", "H9"],
          ["H4", "H7", "H10"],
        ],
        tricks: [["H2"]],
      });
    });

    test("second play", () => {
      let currentState = {
        hands: [
          ["H2", "H12"],
          ["H3", "H8", "H13"],
          ["H4", "H9", "H14"],
        ],
        tricks: [["H7"]],
      };
      assert.deepEqual(playCard("H13", currentState), {
        hands: [
          ["H2", "H12"],
          ["H3", "H8"],
          ["H4", "H9", "H14"],
        ],
        tricks: [["H7", "H13"]],
      });
    });

    test("third play", () => {
      let currentState = {
        hands: [
          ["H2", "H12"],
          ["H3", "H8"],
          ["H4", "H9", "H14"],
        ],
        tricks: [["H7", "H13"]],
      };
      assert.deepEqual(playCard("H9", currentState), {
        hands: [
          ["H2", "H12"],
          ["H3", "H8"],
          ["H4", "H14"],
        ],
        tricks: [["H7", "H13", "H9"]],
      });
    });
  });

  describe("second trick", () => {
    test("first play", () => {
      let currentState = {
        hands: [
          ["H2", "H12"],
          ["H3", "H8"],
          ["H4", "H14"],
        ],
        tricks: [["H7", "H13", "H9"]],
      };
      assert.deepEqual(playCard("H3", currentState), {
        hands: [["H2", "H12"], ["H8"], ["H4", "H14"]],
        tricks: [["H7", "H13", "H9"], ["H3"]],
      });
    });
  });
});
