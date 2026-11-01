function Mini({ c }) {
    return (
        <div className="p-2.5" style={{ background: c.surface }}>
            <div
                className="overflow-hidden border rounded-md"
                style={{ background: c.background, borderColor: c.border }}
            >
                <div className="flex h-4 items-center gap-1 px-1.5" style={{ background: c.primary }}>
                    <span className="w-1 h-1 rounded-full bg-white/70" />
                    <span className="w-1 h-1 rounded-full bg-white/50" />
                </div>
                <div className="space-y-1.5 p-2">
                    <div className="h-1.5 w-2/3 rounded-full" style={{ background: c.text }} />
                    <div className="h-1.5 w-full rounded-full" style={{ background: c.textMuted, opacity: 0.4 }} />
                    <div className="flex items-center gap-1 pt-0.5">
                        <span className="h-3.5 w-8 rounded" style={{ background: c.primary }} />
                        <span className="h-3.5 w-8 rounded" style={{ background: c.secondary }} />
                        <span className="h-3.5 w-3.5 rounded-full" style={{ background: c.accent }} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ThemeThumb({ colors, darkColors }) {
    const dark = darkColors && darkColors.background ? { ...colors, ...darkColors } : null;

    return (
        <div dir="ltr" className={dark ? 'grid grid-cols-2' : ''}>
            <Mini c={colors} />
            {dark && <Mini c={dark} />}
        </div>
    );
}