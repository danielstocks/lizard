import { describe, test } from "node:test";
import assert from "node:assert";

import { pluralize, offsetArray, offsetIndex, createDeck } from "./util.js";

describe("pluralize", () => {
  test("singlular", () => {
    assert.strictEqual(pluralize(1), "");
  });
  test("plural", () => {
    assert.strictEqual(pluralize(0), "s");
    assert.strictEqual(pluralize(2), "s");
  });
});

describe("offset array", () => {
  test("offsets an array by given offset", () => {
    let array = ["a", "b", "c", "d"];
    assert.deepStrictEqual(offsetArray(array, 2), ["c", "d", "a", "b"]);
  });
});

describe("offset index", () => {
  test("offsets an index by given offset and length", () => {
    assert.deepStrictEqual(offsetIndex(5, 6, 3), 2);
  });

  test("offsets an index by given offset and length variation", () => {
    assert.deepStrictEqual(offsetIndex(2, 3, 1), 0);
  });
});

describe("create cards", () => {
  test("60 cards in a deck", () => {
    assert.strictEqual(createDeck().length, 60);
  });
});
