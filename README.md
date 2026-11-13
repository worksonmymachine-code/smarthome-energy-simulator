# SmartHome Energy Simulator

An interactive, browser-only virtual household. Switch appliances ON/OFF, watch active power, energy and the projected electricity bill change instantly, set a monthly budget, see which appliances cost the most, and run a **simulated power outage** where you must choose exactly three appliances to keep running. Includes **SimpleHome Mode**, an accessibility-focused interface for elderly or less tech-confident users.

Everything runs locally in the browser with fictional data. There is **no backend, database, login, API key, paid service or environment variable**. The app never controls real appliances and never causes a real power outage.

> **Not a real bill.** Wattages and usage hours are fictional simulation assumptions and the tariff (₹7.50/unit) is illustrative. The bill is a simplified projection, not an actual utility bill or official tariff.

## Quick start

Requires [Node.js LTS](https://nodejs.org/) (20.9 or newer) and Git.

```bash
git clone https://github.com/USERNAME/smarthome-energy-simulator.git
cd smarthome-energy-simulator
npm ci
npm run dev
```

Open <http://localhost:3000>.

### Production build

```bash
npm run build
npm run start      # http://localhost:3000
```

### Open it from another device on the same Wi-Fi

```bash
npm run dev:lan        # development server on all network interfaces
# or, after "npm run build":
npm run start:lan
```

1. Find your computer's local IP address: Windows `ipconfig` (IPv4 Address), macOS `ipconfig getifaddr en0`, Linux `hostname -I`.
2. On the other device (same Wi-Fi) open `http://<that-ip>:3000`, for example `http://192.168.1.25:3000`.
3. If it does not load, allow Node.js through your computer's firewall for private networks.

Each device runs its own independent copy of the simulation in its own browser. **State is not shared or synchronised between devices.**

### Other scripts

| Command | Purpose |
|---|---|
| `npm test` | Unit and UI integration tests (Vitest + Testing Library) |
| `npm run typecheck` | TypeScript check (`tsc --noEmit`) |

## Documentation challenge pack

The six requested documentation cards are completed in [`docs/`](docs/README.md): README & Quickstart, Judge Runbook, Five-Test Checklist, User Quickstart, Data & Privacy Note, and Handoff & Limitations.

Capture screenshots after verifying the application locally and save them in `docs/screenshots/`; no unverified screenshots are included.

## Features

- **Interactive house**: six appliances in four rooms, each with icon, rated wattage, daily hours, ON/OFF switch, status and its monthly kWh and cost.
- **Instant recalculation**: active power, daily kWh, monthly kWh, estimated monthly bill and active count update on every change.
- **Target bill**: editable (zero, negative and invalid values are rejected and the last valid target is kept). Shows percentage (bar capped at 100%, real percentage still displayed), remaining budget, "equals target" or the exceeded amount with a warning.
- **Contribution analysis**: appliances ranked by projected monthly kWh with percentage share, a bar chart, the highest consumer flagged, contextual savings advice, and an empty state when everything is OFF.
- **Power Cut (simulated outage, "Minute 40 Twist")**: see below.
- **SimpleHome Mode**: PIN entry, large controls, plain language, One-Tap Energy Saver.
- **Reset simulation** restores the default state.

### Power Cut: simulated outage

1. Press **Start simulated outage** (standard dashboard) or **Turn Power Cut ON** (SimpleHome).
2. A selector lists all appliances with name, wattage and estimated monthly cost, plus a short comfort note and an explanation of the comfort-versus-cost trade-off. **Nothing is pre-selected.**
3. Tick exactly three. The counter shows `n of 3`, a fourth tick is refused with a message, you can untick and change your mind, and the live bill for the current choice is shown. **Confirm outage stays disabled until exactly three are selected.**
4. On confirm, the three chosen appliances are ON (switched on if they were off), all others are OFF, the metrics and bill recalculate, and a visible "simulated power outage is ACTIVE" banner appears.
5. While active, exactly three appliances stay ON:
   - turning an OFF appliance ON opens a **swap** prompt asking which active appliance it replaces;
   - switching one of the three OFF on its own is refused;
   - **Change selection** reopens the selector pre-filled with your current three;
   - **End outage** removes the restriction and keeps the current appliance states.
6. This is enforced in the application logic (`src/lib/powerCut.ts` and the reducer), not only by disabling buttons.

### SimpleHome Mode

Enter through **SimpleHome Mode** (nav bar or hero). The fictional **demo PIN is `1234`**. The PIN check is a local simulation for the prototype and is **not real authentication**. It shows wrong-PIN feedback, supports the on-screen keypad (Clear/Delete) and the physical keyboard, and has a **Standard dashboard** button to return.

SimpleHome uses the same state and calculation engine as the dashboard, so changes in either appear in the other immediately. It offers:

- Large appliance cards with plain names, clear ✔ ON / ○ OFF status and a big Turn ON/OFF button.
- A bill summary with budget, amount left and a simple message: within budget (under 80% of target), approaching target (80–100%), or over budget. Amounts are rounded to whole rupees for readability; the underlying value is the same engine output.
- **SAVE ELECTRICITY**: lists what will be switched OFF and what stays ON, estimates the saving, and changes nothing until you confirm. **Essential appliances (Refrigerator, LED Lights) are never switched off by it.** It is unavailable during a Power Cut so exactly three stay ON.
- The same Power Cut flow and rules as above.

## Assumptions and calculations

| Appliance | Rated power | Daily use | Monthly energy | Monthly cost @ ₹7.50 |
|---|---:|---:|---:|---:|
| Air Conditioner | 1500 W | 6 h | 270.0 kWh | ₹2,025.00 |
| Refrigerator | 200 W | 8 h | 48.0 kWh | ₹360.00 |
| Ceiling Fan | 75 W | 8 h | 18.0 kWh | ₹135.00 |
| LED Lights (4 combined) | 40 W | 5 h | 6.0 kWh | ₹45.00 |
| Television | 120 W | 4 h | 14.4 kWh | ₹108.00 |
| Washing Machine | 500 W | 1 h | 15.0 kWh | ₹112.50 |

With everything ON: 2435 W, 12.38 kWh/day, 371.4 kWh/month, **₹2,785.50**.

- Active power `P = Σ(Sᵢ × Wᵢ)`
- Daily energy `E_daily = Σ(Sᵢ × Wᵢ × Hᵢ) / 1000` kWh
- Monthly energy `E_monthly = E_daily × 30`
- Estimated bill `= E_monthly × R`, with `R = ₹7.50/kWh`
- Target progress `= bill / target × 100` (default target ₹3,000)
- Contribution share `= appliance monthly kWh / total monthly kWh × 100`, ranked high to low
- Savings tip: one hour less per day = `W × 30 / 1000 × R` (AC: ₹337.50/month)

All values are derived from one state object (appliance ON/OFF flags, target, tariff, Power Cut flag); nothing is stored twice.

## Project structure

```text
src/
├── app/            layout, page, global CSS
├── components/     App (shared state + dialogs), Dashboard, SimpleHome, PowerCutDialog
└── lib/
    ├── appliances.ts   appliance definitions and assumptions
    ├── energy.ts       calculation engine, target logic, formatting
    ├── powerCut.ts     outage rules (exactly three, swap, exit)
    ├── saver.ts        Energy Saver rules (essentials protected)
    └── reducer.ts      single state reducer used by both interfaces
tests/              logic tests and UI integration tests
public/fonts/       Style Script (SIL Open Font License, see OFL.txt)
docs/TESTING.md     verification record
```

Stack: Next.js (App Router), React, TypeScript, plain CSS, Vitest. No Tailwind, no external fonts or network requests at build or run time.

## Push to GitHub

Create an empty repository on GitHub first (no README/licence). Replace `USERNAME` below with your GitHub username. If you already have this project locally, do not run `git init` again; add the remote and push your existing repository.

```bash
git branch -M main
git remote add origin https://github.com/USERNAME/smarthome-energy-simulator.git
git push -u origin main
```

If `origin` is already configured, inspect it with `git remote -v` instead of adding it again. Do not initialize a second Git repository inside an existing one.

If this folder already contains a `.git` directory, skip `git init`. `.gitignore` already excludes `node_modules`, `.next`, build output and any `.env` files.

## Limitations

- Fictional data only; not a real bill, meter or tariff.
- No persistence: refreshing the page resets the simulation.
- No cross-device synchronisation.
- The demo PIN is a simulation, not security.

Style Script font © The Style Script Project Authors, licensed under the SIL Open Font License 1.1 (`public/fonts/OFL.txt`).
