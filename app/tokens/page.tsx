import type { Metadata } from "next";
import { TokensView } from "@/components/app/views/TokensView";

export const metadata: Metadata = { title: "Tokens Being Bought" };

export default function TokensPage() {
  return <TokensView />;
}
