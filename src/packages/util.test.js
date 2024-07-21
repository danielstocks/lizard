import { describe, test } from "node:test";
import assert from "node:assert";

import { pluralize } from "./util.js";

describe("pluralize", () => {
  test("singlular", () => {
    assert.strictEqual(pluralize(1), "");
  });
  test("plural", () => {
    assert.strictEqual(pluralize(0), "s");
    assert.strictEqual(pluralize(2), "s");
  });
});
