import { Hero } from "@/components/Hero";
import { ScrollStory } from "@/components/home/ScrollStory";
import { LiveTapePreview } from "@/components/home/LiveTapePreview";
import { HomeTraders } from "@/components/home/HomeTraders";
import { HomeTokens } from "@/components/home/HomeTokens";

// Every homepage section is a pinned, scroll-driven stage (components/scroll/
// Pinned): the viewport holds on each one while its content plays through,
// then releases into the next with normal scrolling.
export default function HomePage() {
  return (
    <>
      <Hero />
      <ScrollStory />
      <LiveTapePreview />
      <HomeTraders />
      <HomeTokens />
    </>
  );
}
