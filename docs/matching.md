# Jumi matching formula

Source: `lib/matching/factors.ts` (raw factor scores) and `lib/matching/score.ts` (priorities, overall, explanations).
Everything is pure and deterministic, with no randomness and no framework imports.

## 1. Factors and weights

| Factor | Weight | Raw score (0–100) |
|---|---|---|
| Skills | 35 | Weighted credit over required (×2) and preferred (×1) skills |
| Experience | 20 | `min(100, countedMonths / minMonths × 100)`, or 100 if no minimum |
| Pay | 20 | 100 if `offer.max ≥ ask.min`; otherwise decays linearly, reaching 0 at a 30% shortfall |
| Location | 15 | Remote role or same city 100 · same metro 75 · open to relocate 50 · else 0 |
| Work setup | 10 | Matrix below, taking the best of the candidate's accepted setups |

**Skill credit**: a declared skill earns 0.8 / 0.95 / 1.0 by proficiency (basic / working / strong).
A skill that appears **only in evidence** (project, internship, certification, portfolio) earns 0.8.
This is how a capstone counts toward a skill even with zero years of experience.
If any **required** skill is missing entirely, Skills is a `gap`, whatever the ratio says.

**Counted experience** = work months + internship months (default 3) + 2 months per project
that uses a vacancy skill (projects are capped at 6 months, so they can't replace a real year).

**Work setup matrix** (wanted → offered):

|  | On-site | Hybrid | Remote |
|---|---|---|---|
| On-site | 100 | 60 | 0 |
| Hybrid | 60 | 100 | 60 |
| Remote | 0 | 60 | 100 |

## 2. Status

`met` ≥ 80 · `partial` 40–79 · `gap` < 40.

## 3. Essential vs preferred

Each factor is either `essential` or `preferred`. **Whose** priority applies depends on who's viewing:

| Factor | `scoreForCandidate` (jobseeker view) | `scoreForEmployer` (employer view) |
|---|---|---|
| Skills | vacancy | vacancy |
| Experience | vacancy | vacancy |
| Pay | candidate | vacancy |
| Location | candidate | vacancy |
| Work setup | candidate | vacancy |

- **Preferred** factors are softened: `effective = 50 + raw / 2`. A miss only dents the overall score.
- **Essential** factors use the raw score.

## 4. Overall

```
overall = Σ(weight × effective) / Σ(weight)
if any essential factor is a gap: overall = min(overall, 59), and hasEssentialGap = true
```

Gaps are **never filtered out**. All five factors are always returned with a plain-language note,
so the person can still decide to pursue (or consider) a match with a known gap.

## 5. Mutual score

`mutual = round(√(candidateView × employerView))`, the geometric mean. A pair that is great for one side
but poor for the other scores lower than a simple average would.

## 6. Explanations

- Every factor carries a viewer-oriented `note` ("Hybrid vs. your remote wish. Preferred only, so it doesn't block.").
- `summary` is one sentence, verdict first: "Strong fit: 3 of 3 essentials met. Experience and Work setup are preferred differences, not blockers."
- `evidenceBoosts` lists the evidence items that supported a vacancy skill.

## 7. What this is not

The weights are a transparent starting point for the pilot, not a validated model. Jumi doesn't claim the
matching is novel or predictive of hiring outcomes. Applicants decide whether to pursue a role, and employers
keep every hiring decision.
