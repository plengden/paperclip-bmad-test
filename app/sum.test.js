import test from "node:test";
import assert from "node:assert/strict";
import { sum } from "./sum.js";

test("adds numbers", () => assert.equal(sum([1, 2, 3.5]), 6.5));
test("empty array is 0", () => assert.equal(sum([]), 0));
test("negative numbers", () => assert.equal(sum([-4, 1]), -3));
test("non-array throws TypeError", () => assert.throws(() => sum("12"), TypeError));
test("non-finite or non-number elements throw TypeError", () => {
  for (const bad of [NaN, Infinity, "1", null, undefined]) assert.throws(() => sum([1, bad]), TypeError);
});
