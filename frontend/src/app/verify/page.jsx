import { ShieldCheck } from 'lucide-react';
import VerifyForm from '@/components/forms/VerifyForm';
import { arabic } from '@/lib/fonts';
import { getT } from '@/lib/serverTexts';

export async function generateMetadata() {
    const t = await getT();
    return { title: t('verify_meta'), robots: { index: false, follow: true } };
}

export default async function VerifyPage() {
    const t = await getT();

    return (
        <main
            dir="rtl"
            lang="ar"
            className={`${arabic.variable} min-h-[80svh] bg-background pb-20 pt-36 font-arabic sm:pt-44`}
        >
            <div className="max-w-3xl px-5 mx-auto text-center sm:px-8">
                <span className="flex items-center justify-center w-16 h-16 mx-auto mb-6 rounded-3xl bg-primary/10 text-primary">
                    <ShieldCheck size={30} />
                </span>
                <p className="text-sm font-semibold text-primary">{t('verify_eyebrow')}</p>
                <h1 className="mt-3 text-3xl font-extrabold leading-[1.4] sm:text-5xl">
                    {t('verify_title')}{' '}
                    <span className="text-transparent bg-gradient-to-l from-primary via-accent to-secondary bg-clip-text">
                        {t('verify_highlight')}
                    </span>
                </h1>
                <p className="max-w-xl mx-auto mt-5 leading-8 text-muted">{t('verify_description')}</p>
                <div className="mt-10">
                    <VerifyForm />
                </div>
            </div>
        </main>
    );
}