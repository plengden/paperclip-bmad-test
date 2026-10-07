import test from "node:test";
import assert from "node:assert/strict";
import { average } from "./stats.js";

test("averages numbers", () => assert.equal(average([2, 4, 6]), 4));
