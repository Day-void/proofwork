import test from "node:test";
import assert from "node:assert/strict";
import { assertTransition, canTransition } from "../src/features/assessment/state.ts";

test("verification state allows an appealed request to reopen", () => {
  assert.equal(canTransition("appealed", "submitted"), true);
  assert.doesNotThrow(() => assertTransition("appealed", "submitted"));
});

test("verification state rejects publishing a submitted request directly", () => {
  assert.equal(canTransition("submitted", "approved"), false);
  assert.throws(() => assertTransition("submitted", "approved"), /Invalid verification transition/);
});
