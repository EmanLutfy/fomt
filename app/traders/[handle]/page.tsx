import type { Metadata } from "next";
import { TraderView } from "@/components/app/views/TraderView";

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params;
  return { title: decodeURIComponent(handle) };
}

export default async function TraderPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  return <TraderView id={handle} />;
}
