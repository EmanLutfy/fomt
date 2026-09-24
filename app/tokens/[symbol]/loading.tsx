import { container, sectionPad } from "@/lib/ui";
import { LoadingState } from "@/components/ui/EmptyState";

export default function Loading() {
  return (
    <div className={`${sectionPad} pt-10 sm:pt-14`}>
      <div className={container}>
        <LoadingState label="Loading token activity" />
      </div>
    </div>
  );
}
