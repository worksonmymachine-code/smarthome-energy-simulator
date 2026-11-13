# Data & Privacy Note

## Data used by the application

The prototype uses fictional, predefined appliance data from `src/lib/appliances.ts`, including appliance names, room labels, rated wattage, assumed daily usage hours, essential-appliance flags and comfort descriptions. It also uses a default target bill of ₹3,000 and an illustrative tariff of ₹7.50/kWh.

During a session, application state includes appliance ON/OFF flags, the target and tariff, simulated outage state, temporary dialog/selection state and the digits entered on the SimpleHome PIN screen.

## Browser storage and persistence

The application state is held in React memory. It is not saved to `localStorage`, `sessionStorage`, IndexedDB or cookies. Refreshing the page or reopening the app returns the simulation to its initial defaults. The PIN input is not persisted.

## Simulated values

- Appliance wattages and daily usage hours are sample assumptions.
- The ₹7.50/kWh rate is illustrative, not an official utility tariff.
- Energy use and bill values are estimates, not meter readings or actual bills.
- Power Cut is an interface simulation; it does not detect a grid outage or control circuits.
- SimpleHome PIN `1234` is a demo gate, not authentication.
- Same-Wi-Fi access does not synchronize state between devices.

## Network and external services

The application is designed to run locally and does not require application-level API calls, analytics, telemetry, remote databases or authentication providers. The bundled font is served locally by the application. Installing dependencies with `npm ci` requires access to the configured npm package registry; normal use of the running application does not require an external API.

When the LAN scripts are used, devices on the same network may load the hosted page. Each browser has its own independent in-memory state.

## Secrets and personal information

No real personal information or credentials are required to use the prototype. Do not add API tokens, passwords, private data or `.env` files to the repository. Review staged files before pushing to GitHub.

## Summary

This is a local demonstration using fictional sample data. It is not a production account system, smart-meter service or secure home-control product.
