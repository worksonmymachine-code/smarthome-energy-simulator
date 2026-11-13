# Automated Testing & Verification Record

Run these commands from the project root after installing dependencies with `npm ci`.

## Verification commands

| Check | Command | Result |
|---|---|---|
| Clean dependency install | `npm ci` | Not recorded in this document. Run locally and record the result. |
| TypeScript check | `npm run typecheck` | Not recorded. Run locally and record the result. |
| Automated tests | `npm test` | Not recorded. Run locally and record the result. |
| Production build | `npm run build` | Not recorded. Run locally and record the result. |
| Production server | `npm run start` | Optional manual check after a successful build. |

Do not mark a check as PASS until it has been run against the current commit. Record the date, Node.js version, npm version and output summary when preparing a formal submission.

## Commands

```powershell
npm ci
npm run typecheck
npm test
npm run build
```

To check the production server after the build:

```powershell
npm run start
```

Open http://localhost:3000.

## Test coverage described by the test suite

The repository contains two test files:

- `tests/logic.test.ts`: calculation, target handling, Power Cut state rules and Energy Saver logic.
- `tests/app.test.tsx`: UI integration workflows, including SimpleHome and Power Cut interactions.

The tests are intended to cover:

- All-on and all-off energy calculations, AC contribution and savings.
- Target values below, equal to and above the projected bill, plus invalid input handling.
- Exact-three outage selection, no initial preselection, fourth-appliance replacement, outage exit and invalid state transitions.
- SimpleHome PIN feedback, shared state, Energy Saver confirmation and protected essential appliances.

The presence of test cases does not itself establish that they pass. Run `npm test` and record the actual result.

## Manual verification

Use [FIVE-TEST-CHECKLIST.md](FIVE-TEST-CHECKLIST.md) for five reproducible browser scenarios. Visual appearance, mobile layout and assistive-technology behaviour require manual inspection; automated unit/UI tests do not establish those properties.

## Verification record to complete

| Field | Recorded value |
|---|---|
| Date tested | |
| Operating system | |
| Node.js version (`node --version`) | |
| npm version (`npm --version`) | |
| `npm ci` | |
| `npm run typecheck` | |
| `npm test` | |
| `npm run build` | |
| Browser / manual checklist | |

Do not claim screenshots, browser checks, LAN access or deployment verification unless those checks were actually performed.
