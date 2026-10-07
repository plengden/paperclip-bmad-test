import test from "node:test";
import assert from "node:assert/strict";
import { greet } from "./index.js";

test("greets", () => assert.equal(greet(" Ada "), "Hello, Ada!"));
test("rejects empty", () => assert.throws(() => greet(" "), TypeError));
