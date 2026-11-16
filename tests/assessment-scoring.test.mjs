import test from "node:test";
import assert from "node:assert/strict";
import { disagreementCriteria, requiresModeration } from "../src/features/assessment/scoring.ts";

test("a one-level difference does not trigger moderation", () => {
  const ratings = [
    { reviewId: "one", criterionId: "accessibility", rating: "developing" },
    { reviewId: "two", criterionId: "accessibility", rating: "meets_expectations" },
  ];
  assert.equal(requiresModeration(ratings), false);
  assert.deepEqual(disagreementCriteria(ratings), []);
});

test("a two-level difference flags the affected competency", () => {
  const ratings = [
    { reviewId: "one", criterionId: "accessibility", rating: "developing" },
    { reviewId: "two", criterionId: "accessibility", rating: "strong" },
    { reviewId: "one", criterionId: "testing", rating: "meets_expectations" },
    { reviewId: "two", criterionId: "testing", rating: "strong" },
  ];
  assert.equal(requiresModeration(ratings), true);
  assert.deepEqual(disagreementCriteria(ratings), ["accessibility"]);
});

test("insufficient evidence and a strong rating trigger moderation", () => {
  assert.deepEqual(disagreementCriteria([
    { reviewId: "one", criterionId: "testing", rating: "insufficient_evidence" },
    { reviewId: "two", criterionId: "testing", rating: "strong" },
  ]), ["testing"]);
});

test("one assessor cannot create an inter-rater disagreement", () => {
  assert.equal(requiresModeration([
    { reviewId: "one", criterionId: "quality", rating: "developing" },
  ]), false);
});

test("duplicate criterion rows from one review do not amplify a gap", () => {
  assert.equal(requiresModeration([
    { reviewId: "one", criterionId: "quality", rating: "developing" },
    { reviewId: "one", criterionId: "quality", rating: "strong" },
    { reviewId: "two", criterionId: "quality", rating: "meets_expectations" },
  ]), false);
});
