export default function PageSkeleton() {
  return (
    <div className="min-h-screen">
      {/* header */}
      <div className="sticky top-0 z-10 border-b border-[var(--color-surface-border)] bg-[rgba(6,13,23,0.7)] backdrop-blur-lg">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-4">
          <div className="skeleton h-9 w-28 rounded-full" />
          <div className="hidden gap-2 sm:flex">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-9 w-24 rounded-full" />
            ))}
          </div>
          <div className="flex gap-2">
            <div className="skeleton h-9 w-24 rounded-full" />
            <div className="skeleton h-9 w-20 rounded-full" />
          </div>
        </div>
      </div>

      {/* body */}
      <div className="mx-auto max-w-[1200px] px-4 py-10">
        <div className="skeleton mb-6 h-8 w-48 rounded-lg" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton aspect-[3/4] rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
