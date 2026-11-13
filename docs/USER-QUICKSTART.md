# User Quickstart

SmartHome Energy Simulator lets you explore how household appliance usage changes estimated energy consumption and a projected monthly bill. It uses fictional sample values and does not control real appliances.

## 1. Open the dashboard

Start the application using the root README, then open http://localhost:3000. The initial dashboard shows six sample appliances switched ON. No account or personal information is required.

## 2. Turn appliances on or off

Use an appliance card's switch. The dashboard recalculates active power, daily and monthly energy, projected bill and appliance contribution ranking. Each appliance uses an assumed wattage and daily usage duration.

For example, turning the 1500 W Air Conditioner OFF reduces the model's monthly projection by 270 kWh and ₹2,025 at the illustrative tariff.

## 3. Set a monthly target

Enter a positive amount in **Monthly target bill**. The dashboard compares the projected bill with that target and displays the remaining amount or overspend. Zero, negative and invalid values are rejected; the last valid target remains active.

## 4. Try Power Cut or SimpleHome

**Power Cut**
1. Choose **Start simulated outage**.
2. Select exactly three appliances yourself. Nothing is preselected.
3. Confirm to keep those three ON and switch the others OFF.
4. To turn on a different appliance during the outage, replace one of the active three.
5. Choose **End outage** to remove the restriction. Current appliance states are kept.

**SimpleHome**
1. Choose **SimpleHome Mode**.
2. Enter the demo PIN `1234`.
3. Use the large appliance controls or **SAVE ELECTRICITY**.
4. Review the proposed changes and confirm only if you want to apply them.
5. Return using **Standard dashboard**.

Energy Saver does not switch off the Refrigerator or LED Lights and is unavailable during an active Power Cut.

## Recover from a mistake

- Cancel an open dialog if you do not want to apply its proposed selection.
- Use **Reset simulation** on the standard dashboard to restore the initial state.
- Refreshing the page also restores defaults. The prototype does not save progress between refreshes.

## Important

The tariff, wattages and usage hours are illustrative assumptions. Power Cut is a simulated scenario. The SimpleHome PIN is a demo access gate, not secure authentication.
