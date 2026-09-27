import type { Metadata } from "next";
import { FollowsView } from "@/components/app/views/FollowsView";

export const metadata: Metadata = { title: "Who Followed Who" };

export default function FollowsPage() {
  return <FollowsView />;
}
