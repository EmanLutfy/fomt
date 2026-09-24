export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <p className="text-sm font-medium text-ink">{title}</p>
      <p className="max-w-sm text-sm text-ink-dim">{description}</p>
      {action}
    </div>
  );
}

export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <span className="h-1.5 w-24 overflow-hidden bg-border">
        <span className="block h-full w-1/3 animate-loading-bar bg-accent" />
      </span>
      <p className="text-sm text-ink-dim">{label}…</p>
    </div>
  );
}
