import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-24 text-center">
      <p className="text-[13px] uppercase tracking-[0.1em] text-ink-dim">404</p>
      <h1 className="mt-3 text-[2rem] font-medium tracking-[-0.03em]">Nothing on the tape here</h1>
      <p className="mt-2 text-ink-dim">That page doesn&apos;t exist. The live tape is still running though.</p>
      <Link href="/tape" className="mt-6 inline-block rounded-full bg-ink px-5 py-2.5 text-[14px] font-medium text-bg">
        Open the live tape
      </Link>
    </div>
  );
}
