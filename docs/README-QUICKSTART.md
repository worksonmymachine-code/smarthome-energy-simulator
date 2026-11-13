# README & Quickstart

## Project

SmartHome Energy Simulator is a browser-based demonstration of how appliance usage affects estimated household energy consumption and a projected monthly bill. Users can toggle six fictional appliances, set a monthly target, inspect contribution rankings, try a simulated outage that requires exactly three selected appliances, and use SimpleHome Mode.

The application runs locally in the browser. It does not connect to meters, grids or physical appliances.

## Requirements

- Node.js 20.9 or newer
- npm (included with Node.js)
- Git, if cloning from GitHub

No API keys, `.env` file, database, account, backend service or paid service is required.

## Run from a fresh clone

Replace `USERNAME` with the GitHub account that owns the repository:

```powershell
git clone https://github.com/USERNAME/smarthome-energy-simulator.git
cd smarthome-energy-simulator
npm ci
npm run dev
```

Open http://localhost:3000.

## Verify the project

Run these from the project root:

```powershell
npm run typecheck
npm test
npm run build
```

To serve a production build locally:

```powershell
npm run start
```

## Open on another device on the same Wi-Fi

For development:

```powershell
npm run dev:lan
```

For a production build:

```powershell
npm run build
npm run start:lan
```

Find the host computer's IPv4 address with `ipconfig`, then open `http://HOST-IP:3000` on the other device. Both devices must be on the same network. A firewall may need to allow Node.js on private networks. Each browser has independent in-memory state; there is no cross-device synchronization.

## Demo assumptions

The six appliance ratings, usage hours, ₹7.50/kWh tariff and ₹3,000 target are illustrative sample values. They are not measured consumption or an official utility tariff. With all appliances ON, the expected model output is 2435 W, 12.38 kWh/day, 371.4 kWh/month and ₹2,785.50/month.

See the root [README](../README.md) for the full feature description and formulas. See [TESTING.md](TESTING.md) for automated test commands and [FIVE-TEST-CHECKLIST.md](FIVE-TEST-CHECKLIST.md) for manual scenarios.
