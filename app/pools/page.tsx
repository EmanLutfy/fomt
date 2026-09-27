import type { Metadata } from "next";
import { PoolsView } from "@/components/app/views/PoolsView";

export const metadata: Metadata = { title: "Fresh Pools" };

export default function PoolsPage() {
  return <PoolsView />;
}
