function Bar({ className = '' }) {
    return <div className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />;
}

export default function OverviewSkeleton() {
    return (
        <div className="space-y-6" role="status" aria-busy="true">
            <div className="space-y-2">
                <Bar className="w-56 h-7" />
                <Bar className="h-4 max-w-full w-80" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[0, 1, 2, 3].map((item) => (
                    <div key={item} className="p-5 card">
                        <Bar className="mb-4 h-11 w-11 !rounded-xl" />
                        <Bar className="w-20 h-8" />
                        <Bar className="h-4 mt-3 w-28" />
                        <Bar className="w-24 h-3 mt-2" />
                    </div>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="card lg:col-span-2">
                    <div className="px-5 py-4 border-b border-slate-100">
                        <Bar className="h-5 w-36" />
                    </div>
                    <ul className="divide-y divide-slate-100">
                        {[0, 1, 2, 3, 4].map((item) => (
                            <li key={item} className="flex items-center justify-between gap-4 px-5 py-3.5">
                                <div className="space-y-2">
                                    <Bar className="w-32 h-4" />
                                    <Bar className="w-48 h-3" />
                                </div>
                                <Bar className="h-6 w-16 !rounded-full" />
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="p-5 space-y-2 card">
                    <Bar className="w-32 h-5 mb-3" />
                    {[0, 1, 2, 3].map((item) => (
                        <Bar key={item} className="h-12 w-full !rounded-xl" />
                    ))}
                </div>
            </div>
        </div>
    );
}