import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SmartHome Energy Simulator",
  description: "Interactive browser-only household energy and bill simulator with SimpleHome Mode and a simulated power-outage challenge.",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body data-view="std">{children}</body>
    </html>
  );
}
