# Verification record

Run in a clean `git clone` of the repository (Node 22, npm 10) with no environment variables set.

| Check | Command | Result |
|---|---|---|
| Clean install from lockfile | `npm ci` | 120 packages installed |
| Type check | `npm run typecheck` | no errors |
| Tests | `npm test` | 20 / 20 passed (2 files) |
| Production build | `npm run build` | compiled; `/` prerendered as static |
| Production server | `npm run start:lan` | HTTP 200 on `localhost:3000` and on the machine's LAN IP; font asset served |
| Dev server | `npm run dev:lan` | HTTP 200 on `localhost:3000` and on the machine's LAN IP |

## What the tests cover

- Formulas: 2435 W, 12.38 kWh/day, 371.4 kWh/month, ₹2,785.50 with everything ON; zero when everything is OFF; AC ranked first; shares total 100%; AC saving ₹337.50.
- Target: below / equal / above states; zero, negative, empty and non-numeric input rejected with the last valid target kept.
- Power Cut: exactly three required (0, 1, 2, 4 and duplicates rejected); nothing pre-selected; confirm disabled until three; fourth tick refused; selection can be changed; non-selected appliances switched OFF and selected ones switched ON; lone switch-OFF refused; fourth appliance becomes a swap that keeps three ON; Change selection pre-fills the user's own three; End outage keeps states; bill recalculated; the reducer ignores invalid actions as well as the UI.
- SimpleHome: wrong PIN feedback, Delete, correct PIN; state shared with the dashboard in both directions; Energy Saver needs confirmation, protects Fridge and Lights, can be declined; saver disabled during outage; same outage flow.

## Not verified here

- Visual appearance in a real browser, on mobile, and screen-reader behaviour. The test environment had no browser, so **no screenshots are included**. Capture them yourself after `npm run dev` if the submission needs them.
- Pushing to GitHub (requires your account).
