export function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-3 w-24 bg-slate-100 rounded" />
              <div className="w-9 h-9 bg-slate-100 rounded-xl" />
            </div>
            <div className="h-8 w-20 bg-slate-100 rounded" />
            <div className="h-3 w-32 bg-slate-100 rounded" />
          </div>
        ))}
      </div>
      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
            <div className="h-4 w-40 bg-slate-100 rounded" />
            <div className="h-48 bg-slate-50 rounded-xl" />
          </div>
        ))}
      </div>
      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3">
            <div className="h-4 w-32 bg-slate-100 rounded" />
            {[...Array(4)].map((_, j) => (
              <div key={j} className="space-y-1">
                <div className="flex justify-between">
                  <div className="h-3 w-28 bg-slate-100 rounded" />
                  <div className="h-3 w-6 bg-slate-100 rounded" />
                </div>
                <div className="h-2 bg-slate-100 rounded-full" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

