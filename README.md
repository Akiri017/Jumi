# Jumi: prototype

Explainable, two-sided job matching for Filipino jobseekers and employers (Philippine Startup Challenge XI · team Priori++).

This prototype is demo-grade. It shows Jumi's combined edge: **both sides' preferences scored together**,
**factor-level explanations**, **required vs preferred** handling, **evidence beyond years of experience**, and
**mutual opt-in** before any chat. Data is seeded and fictional, but the matching engine is real, deterministic and tested.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # matching engine tests (Vitest)
npm run build      # production build
npm run lint
```

Requires Node 20+. Fonts load from Google Fonts at runtime. Offline, the app falls back to system fonts and still works.

## 3-minute demo script

1. **Onboard as Maria** (`/onboarding`): choose *Jobseeker*, review the prefilled profile (note the
   Essential/Preferred chips), tick the Data Privacy Act consent, then **Start discovering**.
2. **Discover**: the top card is **Junior Web Developer · Northwind Digital, 89% Strong fit**. Point out the
   salary/location/setup facts, the solid (required) and outlined (preferred) skill chips with checks, and the verdict line.
3. **Tap the card → Why this match**: "3 of 3 essentials met". Experience and Work setup are *Preferred* gaps
   ("Hybrid vs. your remote wish. Preferred only, so it doesn't block."). JavaScript and Node.js were credited
   **from her internship and capstone**, which you can see under *Evidence that helped*.
4. **Interested** → about 1 second later Northwind "swipes back" → **It's a match!** with an opening move → **Send opening move** →
   chat opens with a mocked reply.
5. Optional contrast: the next card (Junior QA Engineer) shows **59% · Essential gap**. It's flagged and capped, never hidden.
6. **Demo → Northwind Digital**: the vacancy dashboard shows strong fits, gaps and matches per role. **Review candidates**
   brings up Mark (95%) with a live explanation beside the deck on desktop. Open **Matches → Maria** and tap
   *why we matched* to see **the same match from the employer side**, scored with the employer's essentials.

Reset at any time with **Demo → Reset demo data**. Keyboard: ← pass · ↑ super interest · → interested · Enter opens details.

## Architecture

```
app/                    Next.js 16 App Router (client-rendered screens)
  onboarding/           role → profile preview → consent
  (app)/                shell with tabs + demo panel + match moment
    discover/           swipe deck (jobseeker: vacancies · employer: candidates per vacancy)
    why/[v]/[c]/        explainability view, oriented to the current persona
    matches/, chat/[id] mutual matches and private chat (mocked replies)
    profile/, employer/ profile and the employer vacancy dashboard
  brand/                logo directions, tokens, components
components/             brand, swipe, match, demo, ui (no UI library; inline SVG icons)
lib/
  types.ts              domain model (Supabase-friendly field names)
  matching/             PURE scoring engine + tests, no React/Next imports
  data/                 repository interface + local (seed + localStorage) implementation
  state/app-store.tsx   React context + reducer; selectors
  demo/                 deterministic swipe-back simulator, opening-move copy
docs/matching.md        the scoring formula
```

**Swapping in Supabase:** implement `JumiRepository` (`lib/data/repository.ts`) against Supabase/Postgres and
replace `repository` in `local-repository.ts`. The screens and the matching engine don't change.

## What's mocked vs real

| Area | Status |
|---|---|
| Matching engine (5 factors, essential/preferred, evidence credit, two directions, mutual score) | **Real**, deterministic, 36 unit tests |
| Explanations (summary sentence, per-factor notes, evidence boosts) | **Real**, generated from the engine |
| Seed data (10 companies, 12 vacancies, 10 candidates) | Fictional |
| Persistence | `localStorage` in the browser (per device) |
| The other side swiping back | **Simulated**: likes back if their own score ≥ 65 with no essential gap (Maria ↔ Northwind web dev always matches) |
| Chat replies, typing indicator | Mocked, canned replies |
| Auth / accounts | None. Two fixed personas, switchable in the Demo panel |
| Freemium (15 swipes/day, Pro, swipe pack) | UI only. No payments, buttons just add swipes |
| Profile / vacancy editing | Read-only previews |
| Analytics dashboards | Not built (concept note Phase 3); the employer dashboard shows simple counts |

## Positioning guardrails (reflected in copy)

Jumi doesn't claim matching, recommendations or messaging are new, and it makes no placement guarantees.
Applicants decide whether to pursue a role and employers make every hiring decision. Essential gaps are always
shown. Profiles and chat carry a Philippine Data Privacy Act (RA 10173) note.
