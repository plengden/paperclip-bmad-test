import test from "node:test";
import assert from "node:assert/strict";
import { titleCase } from "./text.js";

test("capitalises each word", () => assert.equal(titleCase("hello wORLD"), "Hello World"));
test("collapses and trims whitespace", () => assert.equal(titleCase("  ada   lovelace  "), "Ada Lovelace"));
test("empty string returns empty string", () => assert.equal(titleCase(""), ""));
test("whitespace-only returns empty string", () => assert.equal(titleCase("   \t "), ""));
test("single character word", () => assert.equal(titleCase("a"), "A"));
test("non-string input throws TypeError", () => {
  for (const bad of [null, undefined, 42, {}, []]) assert.throws(() => titleCase(bad), TypeError);
});
