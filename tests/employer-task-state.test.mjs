import test from "node:test";
import assert from "node:assert/strict";
import { transitionEmployerTask } from "../src/features/employer-tasks/state.ts";

test("employer tasks follow invite, accept, submit, review", () => {
  assert.equal(transitionEmployerTask("invited", "accept"), "accepted");
  assert.equal(transitionEmployerTask("accepted", "submit"), "submitted");
  assert.equal(transitionEmployerTask("submitted", "review"), "reviewed");
});

test("learners can decline only a pending invitation", () => {
  assert.equal(transitionEmployerTask("invited", "decline"), "declined");
  assert.throws(() => transitionEmployerTask("declined", "submit"));
  assert.throws(() => transitionEmployerTask("reviewed", "submit"));
});

test("tasks cannot skip required steps or be re-reviewed", () => {
  assert.throws(() => transitionEmployerTask("invited", "submit"));
  assert.throws(() => transitionEmployerTask("accepted", "review"));
  assert.throws(() => transitionEmployerTask("reviewed", "review"));
});
