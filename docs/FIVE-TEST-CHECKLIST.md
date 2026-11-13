# Five-Test Manual Checklist

Run these scenarios in a browser at http://localhost:3000. Mark a test PASS only after observing the expected result. Start each test from **Reset simulation** unless the steps say otherwise.

## Test 1: Invalid monthly target

**Steps**
1. Note the current target, normally ₹3,000.
2. Enter `0`.
3. Try a negative value such as `-100`.
4. If the input permits it, try a non-numeric value.

**Expected**
- Invalid values are rejected with visible feedback.
- The last valid target remains active.
- The bill does not become negative or invalid.

## Test 2: Appliance toggle and live recalculation

**Steps**
1. Reset the simulation.
2. Confirm the starting figures.
3. Switch the Air Conditioner OFF.

**Expected**
- Starting state: 2435 W, 12.38 kWh/day, 371.4 kWh/month and ₹2,785.50.
- With AC OFF: 935 W, 3.38 kWh/day, 101.4 kWh/month and ₹760.50.
- Contribution ranking and the AC's contribution update.

## Test 3: Minute 40 Twist, exactly three appliances

**Steps**
1. Reset the simulation.
2. Start the simulated outage.
3. Confirm the selection is empty.
4. Select Refrigerator, Ceiling Fan and LED Lights.
5. Confirm the outage.
6. Attempt to turn on a fourth appliance and inspect the replacement flow.

**Expected**
- Confirmation is disabled until exactly three appliances are selected.
- After confirmation, only the chosen three are ON.
- Their combined values are 315 W, 2.4 kWh/day, 72 kWh/month and ₹540.00.
- Adding a fourth requires replacing one of the active three; exactly three remain ON.

## Test 4: Reset and refresh behaviour

**Steps**
1. Change appliance states and the target.
2. Use **Reset simulation**.
3. Change a state again and refresh the browser tab.

**Expected**
- Reset restores all six appliances ON, the ₹3,000 target and normal supply.
- Refresh returns to the initial defaults because the prototype does not persist state.

## Test 5: Target equals projected bill

**Steps**
1. Reset the simulation.
2. Set the target to exactly `2785.50`.

**Expected**
- Projected bill remains ₹2,785.50.
- The target status indicates equality.
- Target progress displays 100%.

## Record results

| Test | Date | Browser / device | PASS / FAIL | Notes |
|---|---|---|---|---|
| 1. Invalid target | | | | |
| 2. Live recalculation | | | | |
| 3. Exact-three outage | | | | |
| 4. Reset / refresh | | | | |
| 5. Equal target | | | | |

These are manual acceptance scenarios. They are separate from the automated tests described in [TESTING.md](TESTING.md).
