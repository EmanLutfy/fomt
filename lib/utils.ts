import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// shadcn's class-name helper: joins conditional classes, and lets a later
// Tailwind class override a conflicting earlier one (e.g. a caller's px-2
// beating a component's default px-4).
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
