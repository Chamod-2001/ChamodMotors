export function StatsGridSkeleton({ isAdmin }: { isAdmin: boolean }) {
  const count = isAdmin ? 7 : 2;
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex animate-pulse items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:gap-4 sm:p-5"
        >
          <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-200 sm:h-12 sm:w-12" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-3 w-2/3 rounded bg-slate-200" />
            <div className="h-5 w-1/2 rounded bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-3 h-5 w-1/3 rounded bg-slate-200" />
      <div className="space-y-2">
        <div className="h-4 rounded bg-slate-100" />
        <div className="h-4 rounded bg-slate-100" />
        <div className="h-4 rounded bg-slate-100" />
      </div>
    </div>
  );
}
