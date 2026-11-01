export default function AnalyticsSkeleton() {
    return (
        <div className="mt-6 space-y-6" aria-hidden="true">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="card h-36 animate-pulse bg-slate-100/70" />
                ))}
            </div>
            <div className="card h-96 animate-pulse bg-slate-100/70" />
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="card h-80 animate-pulse bg-slate-100/70 lg:col-span-2" />
                <div className="card h-80 animate-pulse bg-slate-100/70" />
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
                <div className="card h-72 animate-pulse bg-slate-100/70" />
                <div className="card h-72 animate-pulse bg-slate-100/70" />
            </div>
        </div>
    );
}