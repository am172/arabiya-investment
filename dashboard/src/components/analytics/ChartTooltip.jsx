export default function ChartTooltip({ active, payload, label, title, rows }) {
  if (!active || !payload || payload.length === 0) return null;

  const heading = title ? title(label, payload) : '';
  const items = rows(payload);

  return (
    <div
      dir="rtl"
      className="min-w-[10rem] rounded-xl border border-slate-200 bg-card px-3.5 py-3 text-start shadow-lg"
    >
      {heading && <p className="mb-2 text-xs font-semibold text-slate-500">{heading}</p>}
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item.label} className="flex items-center justify-between gap-6 text-sm">
            <span className="flex items-center gap-2 text-slate-600">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
              {item.label}
            </span>
            <span className="font-semibold tabular-nums text-slate-900">{item.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}