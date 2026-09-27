import type { Metadata } from "next";
import { TradersView } from "@/components/app/views/TradersView";

export const metadata: Metadata = { title: "Traders" };

export default function TradersPage() {
  return <TradersView />;
}
