'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldCheck } from 'lucide-react';
import { useT } from '@/components/providers/TextsProvider';
import { formatCodeInput, normalizeCode } from '@/lib/utils/certificate';

export default function VerifyForm({ initial = '' }) {
    const t = useT();
    const router = useRouter();
    const [value, setValue] = useState(initial);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    const handleSubmit = (event) => {
        event.preventDefault();
        const code = normalizeCode(value);
        if (!code) {
            setError(t('verify_invalidFormat'));
            return;
        }
        setError('');
        setBusy(true);
        router.push(`/verify/${code}`);
    };

    return (
        <form onSubmit={handleSubmit} noValidate className="w-full max-w-xl mx-auto">
            <label htmlFor="verify-code" className="block mb-2 text-sm font-semibold">
                {t('verify_inputLabel')}
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
                <input
                    id="verify-code"
                    dir="ltr"
                    autoComplete="off"
                    autoCapitalize="characters"
                    spellCheck={false}
                    value={value}
                    placeholder="XXXX-XXXX-XXXX"
                    onChange={(event) => setValue(formatCodeInput(event.target.value))}
                    aria-invalid={Boolean(error)}
                    className={`w-full flex-1 rounded-full border bg-background px-5 py-3.5 text-center font-mono text-lg tracking-widest outline-none transition placeholder:text-muted/60 focus:border-primary focus:ring-4 focus:ring-primary/15 ${error ? 'border-error' : 'border-border'
                        }`}
                />
                <button
                    type="submit"
                    disabled={busy}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition hover:-translate-y-0.5 disabled:opacity-70"
                >
                    {busy ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                    {t('verify_button')}
                </button>
            </div>
            {error && (
                <p role="alert" className="mt-2 text-sm font-medium text-error">
                    {error}
                </p>
            )}
        </form>
    );
}