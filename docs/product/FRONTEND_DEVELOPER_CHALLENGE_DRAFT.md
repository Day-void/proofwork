# Frontend Developer Challenge — Draft 0.1

**Status:** Proposal for rubric calibration; not a live assessment  
**Target:** Entry-level frontend developer  
**Estimated effort:** Pilot target to be calibrated with learners; do not score speed  
**Pairs with:** [Frontend Developer Verification Rubric — Draft 0.1](FRONTEND_DEVELOPER_RUBRIC_DRAFT.md)

## Candidate brief

Build a small, responsive **Community Workshop Finder** using the supplied workshop data. People should be able to browse upcoming workshops, find one that fits their interests, and understand the details before deciding whether to attend.

This is a fictional practice task. It is not client work and will not be used as a production product. Focus on a clear, accessible experience and explain the choices you made.

## Required user stories

1. As a visitor, I can scan a list of workshops and understand the title, topic, date, format, and intended skill level.
2. As a visitor, I can search workshop titles and filter by topic or skill level; search and filters work together.
3. As a visitor, I can open a workshop to read its description and practical details, then return to the list without losing the current filters.
4. As a visitor, I get a clear empty state when no workshops match my search or filters, and I can reset the controls.
5. As a visitor using a keyboard, I can operate all controls and tell where focus is. If a details panel or dialog is used, I can close it and return focus to the control that opened it.

## Supplied materials

The eventual challenge package should provide the same starter files to each candidate:

- A small JSON fixture of 8–12 fictional workshops with a deliberately varied set of dates, topics, formats, skill levels, and a few missing optional values.
- A short visual direction sheet with ProofWork-neutral colors, spacing tokens, and one desktop and mobile reference frame. It should define hierarchy and essential content, without prescribing every implementation detail.
- A README template for setup, checks performed, and a short decision log.

No live API, paid service, proprietary content, or personal data should be required. If an asset is necessary, supply a licensed asset or use a simple local placeholder.

## Acceptance checks

- The page renders the provided fixture without manual edits to the data.
- Search matches workshop titles without case sensitivity.
- Topic and skill-level filters can be combined and reset.
- A workshop detail view presents all supplied details and handles missing optional data gracefully.
- The detail view is keyboard operable; opening and closing it does not strand focus.
- At 360px, 768px, and 1280px viewport widths, the main task remains usable without horizontal page scrolling.
- The no-results state explains how to recover.
- The README explains how to run the project, what was checked, one trade-off, and one improvement the candidate would make with more time.

The reference widths are review points, not a demand for pixel-perfect matching. Assessors should use the same fixture and acceptance checks for every candidate on this challenge version.

## Implementation boundaries

- Candidates may use a familiar frontend framework or plain HTML, CSS, and JavaScript. The evaluator must receive clear run instructions and a runnable submission.
- External APIs, authentication, deployment, backend persistence, and commercial integrations are out of scope.
- The task should be completed within a reasonable, published window established during the pilot. Do not rate typing speed or reward excessive unpaid effort.
- Candidates may use documentation and ordinary development tools. Any AI assistance policy must be stated before the task; candidates should disclose material assistance and explain their own work.
- Offer reasonable accommodations and an equivalent way to demonstrate each competency.

## Evidence map for assessors

| Rubric competency | Challenge evidence |
|---|---|
| Requirements and interface implementation | The workshop list, combined search/filter behavior, detail view, and recovery states |
| Responsive layout and visual behavior | The same primary task reviewed at the three stated viewport widths |
| Accessibility fundamentals | Semantic structure, input names, keyboard operation, focus visibility, detail-view focus behavior |
| Code structure and maintainability | Component boundaries, data handling, names, duplication, and the setup notes |
| Technical reasoning and problem solving | Candidate's decision log and discussion of one trade-off or issue they worked through |
| Testing and reliability | Checks of combined filters, no results, optional data, and detail open/close behavior |

Assessors should rate only what the artifact, checks, and candidate explanation support. A polished visual alone is not evidence of every competency. When the challenge does not expose a skill, record **Not enough evidence** and use portfolio evidence or a follow-up question rather than infer a low rating.

## Pilot questions

Before making this an official challenge, review it with learners, frontend practitioners, assessors, and employers:

- Can a learner with entry-level experience understand the brief without hidden expectations?
- Does the challenge produce evidence for all six rubric competencies without making any one of them depend on presentation polish?
- Is the completion window reasonable for people with different access needs and circumstances?
- Do independent assessors reach similar conclusions from the same submission? Where they disagree, are the anchors or task unclear?
- Is any part of the task likely to advantage candidates based on framework familiarity rather than the target competencies?

Do not publish ratings from this draft as verified credentials. Finalize the brief and rubric version together after pilot calibration.
