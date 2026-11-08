# Frontend Developer Verification Rubric — Draft 0.1

**Status:** Working draft for assessor and employer review  
**Target:** Entry-level frontend developer  
**Purpose:** Describe practical evidence of frontend skills. This is not a guarantee of job performance or a substitute for an employer's hiring process.

## Assessment model

The assessment should combine two evidence sources:

1. **Portfolio project:** learner-created work with a short account of their role, decisions, and process.
2. **Common role challenge:** a ProofWork or employer-authored task that uses the same brief and evaluation criteria for candidates assessed against this role.

Assessors record which source supports each observation. A strong portfolio cannot silently substitute for a missing challenge, and a challenge result cannot be presented as proof of broader work history. Reports show competency-level results and reasoning; this draft does not define a combined score.

## Rating scale

| Rating | General anchor |
|---|---|
| **Not yet demonstrated** | The available work does not yet meet the entry-level criterion; material requirements are missing or the implementation is unreliable. |
| **Developing** | Some of the criterion is demonstrated, but notable gaps remain or the learner needs substantial guidance to complete it. |
| **Meets entry-level expectations** | The learner completes the core requirement independently, with understandable decisions and no major unresolved issue in this area. |
| **Strong for entry level** | The work is consistently sound and shows careful handling of relevant edge cases, trade-offs, or quality concerns. |
| **Not enough evidence** | There is not enough relevant evidence to make a fair judgment. This is a coverage state, not a low rating. |

Assessors must cite a specific artifact, interaction, test, or learner explanation for each rating. “Not enough evidence” must be used instead of guessing when a competency was not observable.

## Competencies

### 1. Requirements and interface implementation

**What it covers:** Turning a brief into a working interface with understandable content hierarchy, appropriate components, and complete required interactions.

**Look for:** The key user task works end to end; interface states are handled; visible behavior matches the brief; semantics and content are appropriate to the task.

| Developing | Meets entry-level expectations | Strong for entry level |
|---|---|---|
| Delivers part of the main path, but important requirements or states are incomplete. | Delivers the main path and required states; interactions behave predictably and the interface is understandable. | Covers less obvious states and details carefully; implementation remains coherent as requirements interact. |

### 2. Responsive layout and visual behavior

**What it covers:** Maintaining usability and content hierarchy across the specified viewport sizes and input modes.

**Look for:** No unintended overflow; readable content; usable controls; stable navigation; layout adapts rather than merely shrinking.

| Developing | Meets entry-level expectations | Strong for entry level |
|---|---|---|
| Works at one size but has significant layout or usability problems at other required sizes. | Works at all specified sizes with readable content and usable controls. | Handles layout transitions and dense or long content gracefully, with no major loss of hierarchy. |

### 3. Accessibility fundamentals

**What it covers:** Making the primary experience operable and understandable to people using keyboard and assistive technology.

**Look for:** Semantic HTML; accessible names and labels; logical focus order; visible focus; keyboard-operable controls; useful error and status messages; sufficient contrast in the tested interface.

| Developing | Meets entry-level expectations | Strong for entry level |
|---|---|---|
| Relies on visual cues or pointer interaction in ways that block key tasks. | Primary tasks can be completed by keyboard; controls have appropriate semantics and names; key feedback is perceivable. | Applies accessibility consistently across states and proactively handles focus, errors, and non-visual context. |

### 4. Code structure and maintainability

**What it covers:** Organizing the implementation so another developer can understand and safely change it.

**Look for:** Clear component boundaries; sensible reuse; descriptive naming; limited duplication; appropriate state and data flow; no unnecessary abstraction.

| Developing | Meets entry-level expectations | Strong for entry level |
|---|---|---|
| Structure makes changes difficult, with avoidable duplication or tangled responsibilities. | Structure is understandable; related behavior is grouped sensibly; abstractions fit the task. | Keeps the solution simple while making repeated or evolving behavior easy to extend and review. |

### 5. Technical reasoning and problem solving

**What it covers:** How the learner interprets the task, makes implementation choices, and investigates problems.

**Look for:** Explanation of relevant decisions; recognition of trade-offs; ability to identify and correct a defect; distinction between assumptions and requirements.

| Developing | Meets entry-level expectations | Strong for entry level |
|---|---|---|
| Has difficulty explaining key choices or resolving a demonstrated issue without substantial prompting. | Explains the main decisions, identifies a reasonable approach, and can investigate and fix a concrete issue. | Compares viable approaches, explains consequences, and adapts when evidence shows the first approach is not working. |

### 6. Testing and reliability

**What it covers:** Checking that important behavior works and responding appropriately to invalid or unexpected input.

**Look for:** Relevant automated or manual checks; handling of empty, invalid, loading, and error states where applicable; fixes supported by a repeatable check.

| Developing | Meets entry-level expectations | Strong for entry level |
|---|---|---|
| Checks only the happy path or leaves important failures unhandled. | Checks the primary flow and relevant edge cases; failure states are understandable and do not silently corrupt behavior. | Chooses focused checks that catch regressions and covers important boundary conditions without unnecessary test complexity. |

The **Not yet demonstrated** anchor applies when the evidence shows the criterion is not met. The **Not enough evidence** state applies when the work did not give the assessor a fair opportunity to observe it.

## Challenge design guardrails

- Use one shared brief and the same required outcomes for this role version.
- Permit common frontend frameworks or a plain HTML/CSS/JavaScript solution; score the demonstrated competencies, not framework preference.
- State the allowed tools, expected deliverables, and any external assistance rules before the task begins.
- Avoid unnecessary speed scoring. Agree on a reasonable completion window and provide accommodations where needed.
- Include at least one interaction, one responsive requirement, and one accessibility requirement so those competencies can actually be observed.
- Keep the challenge small enough to complete without unpaid production work for an employer.

## Reporting and fairness rules for the pilot

- Show each competency separately, with the rating, assessor rationale, and evidence references.
- Identify whether evidence came from the portfolio, the common challenge, or both.
- Do not calculate or market a single overall score in this first pilot.
- Do not treat missing evidence as failure; show **Not enough evidence** and let the learner add evidence or request another assessment.
- Assessors disclose conflicts of interest. Large rating disagreements go to moderation rather than being silently averaged.
- Preserve the rubric version used so later rubric changes do not rewrite earlier assessment meaning.

## Questions to resolve before implementation

1. Is entry-level frontend developer the first role and target proficiency level?
2. Should the first challenge be ProofWork-authored, employer-authored, or a reviewed shared library task?
3. What challenge completion window and accommodation policy are practical and fair?
4. Which evidence can be public in a report, and which stays private to the learner and assigned assessors?
5. How many independent assessors should score the pilot, and what disagreement threshold triggers moderation?

This rubric is a starting point. It should be reviewed by experienced frontend practitioners, assessors, learners, and hiring employers before it is used to make consequential claims.
