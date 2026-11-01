export default function Switch({ checked, onChange, label, disabled = false }) {
    return (
        <button
            type="button"
            dir="ltr"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            disabled={disabled}
            onClick={() => onChange(!checked)}
            className={`relative h-6 w-11 shrink-0 rounded-full transition disabled:opacity-50 ${checked ? 'bg-brand-600' : 'bg-slate-300'
                }`}
        >
            <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? 'left-[1.375rem]' : 'left-0.5'
                    }`}
            />
        </button>
    );
}