export default function SkeletonTable({ rows = 5, columns = 6 }: { rows?: number, columns?: number }) {
  return (
    <div className="w-full">
      {Array.from({ length: rows }).map((_, i) => (
        <div 
          key={i} 
          className="flex items-center gap-4 py-4 px-4 border-b border-slate-100 animate-pulse last:border-0"
        >
          {Array.from({ length: columns }).map((_, j) => (
            <div 
              key={j} 
              className={`h-4 bg-slate-200 rounded ${
                j === 0 ? 'w-12' : 
                j === 1 ? 'w-32' : 
                j === columns - 1 ? 'w-20 ml-auto' : 
                'w-full max-w-[120px]'
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
