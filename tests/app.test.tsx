import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "@/components/App";

const sw = (name: string) => screen.getByRole("switch", { name });
const dialog = () => screen.getByRole("dialog");
const pickOutage = async (u: ReturnType<typeof userEvent.setup>, names: string[]) => {
  for (const n of names) await u.click(within(dialog()).getByRole("checkbox", { name: new RegExp(n) }));
};

describe("standard dashboard", () => {
  it("updates metrics immediately on switching (STEP 01)", async () => {
    const u = userEvent.setup(); render(<App />);
    expect(screen.getByTestId("bill")).toHaveTextContent("₹2,785.50");
    await u.click(sw("Air Conditioner"));
    expect(screen.getByTestId("power")).toHaveTextContent("935 W");
    expect(screen.getByTestId("bill")).toHaveTextContent("₹760.50");
    expect(screen.getByTestId("count")).toHaveTextContent("5 / 6");
    expect(screen.getByTestId("breakdown").textContent).toMatch(/Refrigerator.*Highest/);
  });
  it("shows the empty state at zero and the AC tip otherwise", async () => {
    const u = userEvent.setup(); render(<App />);
    expect(screen.getByTestId("tip")).toHaveTextContent("₹337.50");
    for (const n of ["Air Conditioner", "Refrigerator", "Ceiling Fan", "LED Lights \\(4 combined\\)", "Television", "Washing Machine"]) await u.click(screen.getByRole("switch", { name: new RegExp(`^${n}$`) }));
    expect(screen.getByTestId("bill")).toHaveTextContent("₹0.00");
    expect(screen.getByText(/All appliances are OFF, so consumption/)).toBeInTheDocument();
  });
  it("handles target below / equal / above and rejects invalid input (STEP 02)", async () => {
    const u = userEvent.setup(); render(<App />);
    const input = screen.getByLabelText(/Monthly target bill/);
    expect(screen.getByTestId("target-status")).toHaveTextContent("₹214.50 remaining");
    await u.clear(input); await u.type(input, "2000");
    expect(screen.getByTestId("target-status")).toHaveTextContent("Over target by ₹785.50");
    await u.clear(input); await u.type(input, "2785.5");
    expect(screen.getByTestId("target-status")).toHaveTextContent("equals your target");
    await u.clear(input); await u.type(input, "-5");
    expect(screen.getByRole("alert", { hidden: true, name: "" }).textContent).toBeDefined();
    expect(screen.getByText(/Enter a number greater than 0/)).toBeInTheDocument();
    expect(screen.getByTestId("target-status")).toHaveTextContent("equals your target"); // last valid target kept
  });
});

describe("simulated outage (STEP 03 + Minute 40 twist)", () => {
  it("requires a manual selection of exactly three and enforces it", async () => {
    const u = userEvent.setup(); render(<App />);
    await u.click(screen.getByRole("button", { name: "Start simulated outage" }));
    const confirm = within(dialog()).getByRole("button", { name: "Confirm outage" });
    expect(within(dialog()).getAllByRole("checkbox").every((c) => !(c as HTMLInputElement).checked)).toBe(true); // nothing auto-selected
    expect(dialog()).toHaveTextContent(/1500 W/);
    expect(dialog()).toHaveTextContent(/Selected: 0 of 3/);
    await pickOutage(u, ["Refrigerator", "Ceiling Fan"]);
    expect(confirm).toBeDisabled();
    await pickOutage(u, ["Television"]);
    expect(dialog()).toHaveTextContent(/Selected: 3 of 3/);
    await u.click(within(dialog()).getByRole("checkbox", { name: /Air Conditioner/ })); // 4th refused
    expect(dialog()).toHaveTextContent(/Selected: 3 of 3/);
    expect(dialog()).toHaveTextContent(/Only 3 appliances can stay ON/);
    await u.click(within(dialog()).getByRole("checkbox", { name: /Television/ })); // change mind
    await pickOutage(u, ["LED"]);
    expect(confirm).toBeEnabled();
    await u.click(confirm);
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByTestId("count")).toHaveTextContent("3 / 6");
    expect(screen.getByTestId("pc-status")).toHaveTextContent("Active");
    expect(screen.getByText(/Simulated power outage is ACTIVE/)).toBeInTheDocument();
    expect(screen.getByTestId("bill")).toHaveTextContent("₹" + (((200 * 8 + 75 * 8 + 40 * 5) / 1000) * 30 * 7.5).toLocaleString("en-IN", { minimumFractionDigits: 2 }));
  });
  it("blocks lone switch-off, swaps, then exits keeping states", async () => {
    const u = userEvent.setup(); render(<App />);
    await u.click(screen.getByRole("button", { name: "Start simulated outage" }));
    await pickOutage(u, ["Refrigerator", "Ceiling Fan", "LED"]);
    await u.click(within(dialog()).getByRole("button", { name: "Confirm outage" }));
    await u.click(sw("Refrigerator"));
    expect(sw("Refrigerator")).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText(/exactly 3 appliances must stay ON/)).toBeInTheDocument();
    await u.click(sw("Air Conditioner")); // would be a 4th -> swap prompt
    await u.click(within(dialog()).getByRole("button", { name: /Replace Ceiling Fan/ }));
    expect(sw("Air Conditioner")).toHaveAttribute("aria-checked", "true");
    expect(sw("Ceiling Fan")).toHaveAttribute("aria-checked", "false");
    expect(screen.getByTestId("count")).toHaveTextContent("3 / 6");
    await u.click(screen.getByRole("button", { name: "Change selection" }));
    expect(within(dialog()).getAllByRole("checkbox").filter((c) => (c as HTMLInputElement).checked)).toHaveLength(3);
    await u.click(within(dialog()).getByRole("button", { name: "Cancel" }));
    await u.click(screen.getByRole("button", { name: "End outage" }));
    expect(screen.getByTestId("pc-status")).toHaveTextContent("Inactive");
    expect(screen.getByTestId("count")).toHaveTextContent("3 / 6");
    await u.click(sw("Television"));
    expect(screen.getByTestId("count")).toHaveTextContent("4 / 6");
  });
});

describe("SimpleHome Mode", () => {
  const enter = async (u: ReturnType<typeof userEvent.setup>) => {
    await u.click(screen.getAllByRole("button", { name: "SimpleHome Mode" })[0]);
    for (const k of ["1", "2", "3", "4"]) await u.click(screen.getByRole("button", { name: k }));
  };
  it("rejects a wrong PIN then accepts the demo PIN", async () => {
    const u = userEvent.setup(); render(<App />);
    await u.click(screen.getAllByRole("button", { name: "SimpleHome Mode" })[0]);
    for (const k of ["9", "9", "9", "9"]) await u.click(screen.getByRole("button", { name: k }));
    expect(screen.getByText("That PIN is not right. Please try again.")).toBeInTheDocument();
    await u.click(screen.getByRole("button", { name: "1" })); await u.click(screen.getByRole("button", { name: "Delete last digit" }));
    for (const k of ["1", "2", "3", "4"]) await u.click(screen.getByRole("button", { name: k }));
    expect(screen.getByText("Your home, made simple.")).toBeInTheDocument();
  });
  it("shares state with the dashboard and runs saver with confirmation", async () => {
    const u = userEvent.setup(); render(<App />);
    await enter(u);
    expect(screen.getByTestId("simple-bill")).toHaveTextContent("approaching your target");
    await u.click(screen.getByRole("button", { name: "Turn off TV" }));
    expect(screen.getByTestId("simple-tv")).toHaveTextContent("OFF");
    await u.click(screen.getByRole("button", { name: "SAVE ELECTRICITY" }));
    expect(dialog()).toHaveTextContent(/stay ON for safety/);
    await u.click(within(dialog()).getByRole("button", { name: "No, keep everything" }));
    expect(screen.getByTestId("simple-ac")).toHaveTextContent("ON");
    await u.click(screen.getByRole("button", { name: "SAVE ELECTRICITY" }));
    await u.click(within(dialog()).getByRole("button", { name: /Yes, switch them OFF/ }));
    expect(screen.getByTestId("simple-fr")).toHaveTextContent("ON");
    expect(screen.getByTestId("simple-led")).toHaveTextContent("ON");
    expect(screen.getByTestId("simple-ac")).toHaveTextContent("OFF");
    expect(screen.getByTestId("simple-bill")).toHaveTextContent("within your monthly budget");
    await u.click(screen.getByRole("button", { name: "← Standard dashboard" }));
    expect(screen.getByTestId("count")).toHaveTextContent("2 / 6");
    expect(screen.getByTestId("bill")).toHaveTextContent("₹405.00");
  });
  it("uses the same outage logic", async () => {
    const u = userEvent.setup(); render(<App />);
    await enter(u);
    await u.click(screen.getByRole("button", { name: "Turn Power Cut ON" }));
    await pickOutage(u, ["Refrigerator", "LED", "Television"]);
    await u.click(within(dialog()).getByRole("button", { name: "Confirm outage" }));
    expect(screen.getByRole("button", { name: "SAVE ELECTRICITY" })).toBeDisabled();
    await u.click(screen.getByRole("button", { name: "Turn off Fridge" }));
    expect(screen.getByTestId("simple-fr")).toHaveTextContent("ON");
    expect(screen.getAllByText(/only 3 things can run/i).length).toBeGreaterThan(0);
    await u.click(screen.getByRole("button", { name: "Turn Power Cut OFF" }));
    expect(screen.getByText("Power Cut: OFF")).toBeInTheDocument();
  });
});
