import Link from "next/link";
import { btnPrimary, container, sectionPad } from "@/lib/ui";

export default function NotFound() {
  return (
    <div className={`${sectionPad} flex flex-col items-center pt-24 text-center`}>
      <div className={container}>
        <p className="font-mono text-sm uppercase tracking-[0.2em] text-ink-dim">404</p>
        <h1 className="mt-3 font-sans font-extrabold tracking-tight text-2xl text-ink sm:text-3xl">Nothing tracked here</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm text-ink-muted">
          That wallet, token, or page isn&apos;t part of FOMT&apos;s tracked dataset.
        </p>
        <Link href="/terminal" className={`${btnPrimary} mt-8`}>
          Open the terminal
        </Link>
      </div>
    </div>
  );
}
