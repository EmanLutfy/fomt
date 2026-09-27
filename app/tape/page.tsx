import { Suspense } from "react";
import type { Metadata } from "next";
import { TapeView } from "@/components/app/views/TapeView";

export const metadata: Metadata = { title: "Live Tape" };

export default function TapePage() {
  // useSearchParams (for ?q=) needs a Suspense boundary to prerender.
  return (
    <Suspense>
      <TapeView />
    </Suspense>
  );
}
