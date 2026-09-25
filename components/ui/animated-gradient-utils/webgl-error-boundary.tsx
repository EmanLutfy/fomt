"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { cn } from "@/lib/utils";

// Static stand-in for the animated canvas: shown when the browser has no
// WebGL2, the shader fails to compile, or rendering throws. Same footprint as
// the canvas container, so whatever sits on top keeps its layout.
export function WebGLFallback({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "bg-[radial-gradient(120%_120%_at_20%_0%,#1a1a2e_0%,#0b0b12_55%,#050507_100%)]",
        className,
      )}
    />
  );
}

type Props = { fallback: ReactNode; children: ReactNode };
type State = { hasError: boolean };

// Keeps a WebGL failure contained to the gradient instead of unmounting the
// section around it.
export class WebGLErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("AnimatedGradient fell back to a static background:", error, info.componentStack);
    }
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}
