export type ApplianceId = "ac" | "fr" | "fan" | "led" | "tv" | "wm";

export interface Appliance {
  id: ApplianceId;
  name: string;
  /** Plain-language name used in SimpleHome Mode */
  simpleName: string;
  icon: string;
  room: string;
  /** Rated wattage (fictional simulation assumption) */
  watts: number;
  /** Assumed daily usage hours (fictional simulation assumption) */
  hours: number;
  /** Never switched off by the One-Tap Energy Saver */
  essential: boolean;
  /** Short comfort note shown in the outage selector */
  comfort: string;
}

export const APPLIANCES: readonly Appliance[] = [
  { id: "ac", name: "Air Conditioner", simpleName: "Air Conditioner", icon: "❄️", room: "Bedroom", watts: 1500, hours: 6, essential: false, comfort: "Biggest comfort in hot weather, and by far the biggest cost." },
  { id: "fr", name: "Refrigerator", simpleName: "Fridge", icon: "🧊", room: "Kitchen", watts: 200, hours: 8, essential: true, comfort: "Keeps food and medicines safe. Cheap to run." },
  { id: "fan", name: "Ceiling Fan", simpleName: "Fan", icon: "🌀", room: "Living Room", watts: 75, hours: 8, essential: false, comfort: "Low-cost cooling and air movement." },
  { id: "led", name: "LED Lights (4 combined)", simpleName: "Lights", icon: "💡", room: "Living Room", watts: 40, hours: 5, essential: true, comfort: "Safe movement around the home after dark. Very cheap." },
  { id: "tv", name: "Television", simpleName: "TV", icon: "📺", room: "Living Room", watts: 120, hours: 4, essential: false, comfort: "News and entertainment during the outage." },
  { id: "wm", name: "Washing Machine", simpleName: "Washing Machine", icon: "🧺", room: "Utility Room", watts: 500, hours: 1, essential: false, comfort: "Can usually wait until power returns." },
];

export const ROOMS = ["Living Room", "Bedroom", "Kitchen", "Utility Room"] as const;
export const DEFAULT_TARGET = 3000;
export const DEFAULT_TARIFF = 7.5; // ₹ per kWh, illustrative
export const DAYS_PER_MONTH = 30;

export const byId = (id: ApplianceId): Appliance => {
  const a = APPLIANCES.find((x) => x.id === id);
  if (!a) throw new Error(`Unknown appliance ${id}`);
  return a;
};
