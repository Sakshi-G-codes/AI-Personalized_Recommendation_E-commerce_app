export default function SkeletonCard() {
  return (
    <div className="glass-card overflow-hidden">
      <div className="skeleton h-48 w-full" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-3 w-1/2" />
        <div className="skeleton h-3 w-1/3" />
        <div className="flex justify-between items-center">
          <div className="skeleton h-5 w-16" />
          <div className="skeleton h-7 w-24 rounded-full" />
        </div>
      </div>
    </div>
  );
}
