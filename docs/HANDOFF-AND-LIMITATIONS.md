# Handoff & Limitations

## Code map

| Path | Responsibility |
|---|---|
| `src/app/page.tsx` | Application route entry point. |
| `src/app/layout.tsx` | Root document, metadata and global stylesheet connection. |
| `src/app/globals.css` | Application styling and responsive layout. |
| `src/components/App.tsx` | Shared reducer state, view switching, notifications and dialog orchestration. Connects both interfaces to the same state. |
| `src/components/Dashboard.tsx` | Standard dashboard, appliance controls, energy overview, target input and contribution analysis. |
| `src/components/PowerCutDialog.tsx` | Exact-three outage selection and appliance replacement flow. |
| `src/components/SimpleHome.tsx` | Demo PIN screen, simplified controls and Energy Saver confirmation. |
| `src/lib/appliances.ts` | Fictional appliance definitions and default assumptions. |
| `src/lib/energy.ts` | Energy and bill calculations, target validation and formatting. |
| `src/lib/powerCut.ts` | Outage state, exact-three rules, selection and exit logic. |
| `src/lib/reducer.ts` | Central application state transitions. |
| `src/lib/saver.ts` | Energy Saver candidates and protected essential appliances. |
| `tests/logic.test.ts` | Unit tests for calculations and state rules. |
| `tests/app.test.tsx` | UI integration tests. |

## Calculation model

- Active power: `Σ(Sᵢ × Wᵢ)` watts.
- Daily energy: `Σ(Sᵢ × Wᵢ × Hᵢ) / 1000` kWh.
- Monthly energy: daily energy × 30.
- Estimated bill: monthly energy × tariff.
- Contribution share: appliance monthly kWh ÷ total monthly kWh × 100.

`Sᵢ` is 1 when an appliance is ON and 0 when OFF; `Wᵢ` is its assumed wattage; `Hᵢ` is its assumed daily usage duration. The calculation implementation is in `src/lib/energy.ts`.

## State lifecycle

The application initializes with its default state. Reset simulation creates a fresh initial state. A browser refresh also returns to defaults because state is held in memory and is not persisted in browser storage.

## Deliberately mocked behaviour

1. Appliance ratings and usage hours are fixed fictional inputs, not measured values.
2. The ₹7.50/kWh tariff is a flat illustrative rate, not a location-specific utility tariff or slab calculation.
3. Power Cut is a UI scenario, not real outage detection or physical circuit control.
4. SimpleHome PIN `1234` is hardcoded demo access, not secure authentication.
5. LAN hosting exposes the page to devices that can reach the host; it does not provide shared state or cross-device synchronization.
6. Energy Saver applies fixed rules after user confirmation and protects the Refrigerator and LED Lights.

## Limitations

- No real meter, IoT device or appliance integration.
- No user accounts, authentication service or authorization model.
- No persistence between page refreshes.
- No shared household state across devices.
- No verified local utility tariff, taxes, slabs or demand charges.
- No claim of screen-reader or formal accessibility certification; usability and assistive-technology testing remain necessary.
- The demo PIN must not be treated as a security boundary.

## Sensible next steps before any real deployment

1. Validate appliance consumption assumptions using measured data and implement the correct local utility tariff model.
2. Conduct accessibility and usability testing with intended users, including older adults and assistive-technology users.
3. Complete security, privacy and hazard reviews before considering any physical device integration. Real appliance control would require certified hardware, explicit consent, fail-safe design and independent safety controls.

## Handoff checklist

- [ ] Install dependencies from the lockfile using `npm ci`.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Perform the five manual scenarios in [FIVE-TEST-CHECKLIST.md](FIVE-TEST-CHECKLIST.md).
- [ ] Capture genuine screenshots only after visually checking the running application.
- [ ] Review `git status` and ensure no secrets, dependency folders or build output are staged.
