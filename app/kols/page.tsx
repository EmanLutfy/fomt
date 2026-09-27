import type { Metadata } from "next";
import { KolView } from "@/components/app/views/KolView";

export const metadata: Metadata = { title: "KOL List" };

export default function KolPage() {
  return <KolView />;
}
