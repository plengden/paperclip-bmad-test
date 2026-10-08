import test from "node:test";
import assert from "node:assert/strict";
import { clamp } from "./clamp.js";

test("value inside the range is returned unchanged", () => assert.equal(clamp(5, 0, 10), 5));
test("value below min returns min", () => assert.equal(clamp(-3, 0, 10), 0));
test("value above max returns max", () => assert.equal(clamp(42, 0, 10), 10));
test("bounds are inclusive", () => {
  assert.equal(clamp(0, 0, 10), 0);
  assert.equal(clamp(10, 0, 10), 10);
});
test("min equal to max returns that bound", () => assert.equal(clamp(7, 3, 3), 3));
test("infinite bounds are allowed", () => {
  assert.equal(clamp(5, -Infinity, Infinity), 5);
  assert.equal(clamp(Infinity, 0, 10), 10);
});
test("min greater than max throws RangeError", () => assert.throws(() => clamp(1, 10, 0), RangeError));
test("non-number or NaN arguments throw TypeError", () => {
  for (const bad of [NaN, "5", null, undefined, {}]) {
    assert.throws(() => clamp(bad, 0, 10), TypeError);
    assert.throws(() => clamp(1, bad, 10), TypeError);
    assert.throws(() => clamp(1, 0, bad), TypeError);
  }
});
