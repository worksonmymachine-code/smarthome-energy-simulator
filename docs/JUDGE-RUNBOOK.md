# Judge Runbook: 60-Second Demonstration

## Prepare

1. Start the app using the root README instructions.
2. Open http://localhost:3000.
3. If the app has been used already, select **Reset simulation**.
4. Confirm the standard dashboard starts with all six sample appliances ON.

## Expected starting values

- Active power: **2435 W**
- Daily energy: **12.38 kWh**
- Monthly energy: **371.4 kWh**
- Projected monthly bill: **₹2,785.50**
- Monthly target: **₹3,000**
- Amount below target: **₹214.50**

These are calculated from fictional assumptions, not a real meter or utility bill.

## 60-second demo flow

| Time | Presenter action | Expected result |
|---|---|---|
| 0–10 sec | Introduce the browser-based simulator. Point out the six appliance cards and energy summary. | All six appliances ON; 2435 W, 12.38 kWh/day, 371.4 kWh/month and ₹2,785.50 projected bill. |
| 10–20 sec | Switch the Air Conditioner OFF, then ON again. | With AC OFF: 935 W, 3.38 kWh/day, 101.4 kWh/month and ₹760.50. Switching it ON restores the initial values. |
| 20–30 sec | Change the monthly target to ₹2,500. | The ₹2,785.50 projection is shown as ₹285.50 over target. Restore ₹3,000 if continuing. |
| 30–50 sec | Start the simulated outage. Select Refrigerator, Ceiling Fan and LED Lights, then confirm. | Nothing is preselected. Confirmation is unavailable until exactly three are selected. After confirmation, only those three are ON: 315 W, 2.4 kWh/day, 72 kWh/month and ₹540.00. |
| 50–60 sec | Try to turn on another appliance. Open the replacement flow. | The user must replace one of the three active appliances; a fourth cannot simply be added. |

## Minute 40 Twist: what judges should verify

- The selection starts empty. The app must not choose appliances automatically.
- The user must actively select exactly three.
- The confirm action remains disabled unless exactly three are selected.
- Confirming switches the selected three ON and all others OFF.
- While the outage is active, a fourth appliance requires replacing one of the selected three.
- Ending the outage removes the restriction but does not automatically restore the appliances that were OFF.

## SimpleHome demonstration

If time permits, open **SimpleHome Mode** and enter the demo PIN `1234`. Show the larger controls and **SAVE ELECTRICITY** confirmation. The Energy Saver proposal protects the Refrigerator and LED Lights and makes no changes until confirmed.

## Recovery

Use **Reset simulation** to restore all six appliances ON, the ₹3,000 target and normal supply. Refreshing the page also returns to defaults because state is not persisted.

## Safety and accuracy note

Power Cut is only a UI simulation. The app does not detect real outages or control electrical equipment. SimpleHome PIN `1234` is a demo gate, not secure authentication. All energy and cost figures are illustrative.
