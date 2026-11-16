export type ComparableRating = { reviewId: string; criterionId: string; rating: string };

const ratingScale: Record<string, number> = {
  insufficient_evidence: -1,
  not_yet_demonstrated: 0,
  developing: 1,
  meets_expectations: 2,
  strong: 3,
};

export function disagreementCriteria(ratings: ComparableRating[], minimumGap = 2): string[] {
  const byCriterion = new Map<string, Map<string, number>>();
  for (const item of ratings) {
    const score = ratingScale[item.rating];
    if (score === undefined) continue;
    const byReview = byCriterion.get(item.criterionId) ?? new Map<string, number>();
    byReview.set(item.reviewId, score);
    byCriterion.set(item.criterionId, byReview);
  }
  return [...byCriterion.entries()].flatMap(([criterionId, byReview]) => {
    const scores = [...byReview.values()];
    return scores.length >= 2 && Math.max(...scores) - Math.min(...scores) >= minimumGap ? [criterionId] : [];
  });
}

export function requiresModeration(ratings: ComparableRating[], minimumGap = 2): boolean {
  return disagreementCriteria(ratings, minimumGap).length > 0;
}
