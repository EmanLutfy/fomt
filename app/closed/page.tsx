import type { Metadata } from "next";
import { ClosedView } from "@/components/app/views/ClosedView";

export const metadata: Metadata = { title: "Closed Trades" };

export default function ClosedPage() {
  return <ClosedView />;
}
