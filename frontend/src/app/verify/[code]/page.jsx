import Link from 'next/link';
import { AlertTriangle, SearchX, ShieldCheck, ShieldX } from 'lucide-react';
import VerifyForm from '@/components/forms/VerifyForm';
import { getCertificate } from '@/lib/api/certificates';
import { arabic } from '@/lib/fonts';
import { getT } from '@/lib/serverTexts';
import { formatCertDate, normalizeCode } from '@/lib/utils/certificate';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
    const t = await getT();
    return { title: t('verify_meta'), robots: { index: false, follow: false } };
}

const TONES = {
    valid: { icon: ShieldCheck, box: 'border-success/30 bg-success/10', badge: 'bg-success/15 text-success' },
    revoked: { icon: ShieldX, box: 'border-error/30 bg-error/10', badge: 'bg-error/15 text-error' },
    missing: { icon: SearchX, box: 'border-warning/30 bg-warning/10', badge: 'bg-warning/15 text-warning' },
    invalid: { icon: SearchX, box: 'border-warning/30 bg-warning/10', badge: 'bg-warning/15 text-warning' },
    error: { icon: AlertTriangle, box: 'border-border bg-surface', badge: 'bg-foreground/10 text-foreground' }
};

export default async function VerifyResultPage({ params }) {
    const { code: raw } = await params;
    const t = await getT();
    const code = normalizeCode(decodeURIComponent(raw));
    const result = code ? await getCertificate(code) : { state: 'invalid' };

    const data = result.state === 'found' ? result.data : null;
    const key = data ? (data.valid ? 'valid' : 'revoked') : result.state;
    const tone = TONES[key] || TONES.error;
    const Icon = tone.icon;

    const copy = {
        valid: [t('verify_validTitle'), t('verify_validText')],
        revoked: [t('verify_revokedTitle'), t('verify_revokedText')],
        missing: [t('verify_notFoundTitle'), t('verify_notFoundText')],
        invalid: [t('verify_notFoundTitle'), t('verify_invalidFormat')],
        error: [t('verify_errorTitle'), t('verify_errorText')]
    }[key];

    const rows = data
        ? [
            [t('verify_student'), data.studentName],
            [t('verify_course'), data.courseName],
            [t('verify_serial'), data.serial, true],
            [t('verify_issued'), formatCertDate(data.issueDate)],
            data.completionDate ? [t('verify_completed'), formatCertDate(data.completionDate)] : null,
            data.hours ? [t('verify_hours'), t('verify_hoursValue', { n: data.hours })] : null,
            data.grade ? [t('verify_grade'), data.grade] : null,
            !data.valid && data.revokedAt ? [t('verify_revokedAt'), formatCertDate(data.revokedAt)] : null
        ].filter(Boolean)
        : [];

    return (
        <main
            dir="rtl"
            lang="ar"
            className={`${arabic.variable} min-h-[80svh] bg-background pb-20 pt-36 font-arabic sm:pt-44`}
        >
            <div className="max-w-2xl px-5 mx-auto sm:px-8">
                <div className={`rounded-theme border p-6 text-center sm:p-10 ${tone.box}`}>
                    <span className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${tone.badge}`}>
                        <Icon size={32} />
                    </span>
                    <h1 className="mt-5 text-2xl font-extrabold leading-[1.5] sm:text-3xl">{copy[0]}</h1>
                    <p className="max-w-md mx-auto mt-3 leading-8 text-muted">{copy[1]}</p>
                </div>

                {rows.length > 0 && (
                    <dl className="mt-6 overflow-hidden border divide-y divide-border rounded-theme border-border bg-surface">
                        {rows.map(([label, value, ltr]) => (
                            <div key={label} className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                                <dt className="text-sm text-muted">{label}</dt>
                                <dd dir={ltr ? 'ltr' : undefined} className="font-semibold sm:text-end">
                                    {value}
                                </dd>
                            </div>
                        ))}
                    </dl>
                )}

                <div className="mt-10 text-center">
                    <p className="mb-4 text-sm text-muted">{t('verify_another')}</p>
                    <VerifyForm />
                    <Link href="/" className="inline-block mt-6 text-sm font-medium text-primary hover:underline">
                        {t('common_backHome')}
                    </Link>
                </div>
            </div>
        </main>
    );
}