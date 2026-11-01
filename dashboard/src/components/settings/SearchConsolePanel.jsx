import { useState } from 'react';
import { AlertCircle, Check, CheckCircle2, Copy, ExternalLink, SearchCheck } from 'lucide-react';
import { SITE_URL } from '../../constants/config';
import { useToast } from '../../context/ToastContext';
import { t } from '../../i18n';

const STEPS = [
    {
        title: 'Add your site',
        text: 'Open Google Search Console, press Add property, choose URL prefix and type your website address exactly as it opens in the browser.'
    },
    {
        title: 'Choose the HTML tag method',
        text: 'When asked to verify, pick HTML tag. Copy the code inside content="..." or the whole tag.'
    },
    {
        title: 'Paste it above and save',
        text: 'Paste it in Google verification code in the SEO section and press Save settings. Open your website twice, wait a minute, then press Verify in Google.'
    },
    {
        title: 'Submit the sitemap',
        text: 'In Search Console open Sitemaps, type sitemap.xml and press Submit. Then use URL inspection on your home page and press Request indexing.'
    }
];

const buildChecks = (settings) => {
    const seo = settings.seo || {};
    const title = (seo.title || '').length;
    const description = (seo.description || '').length;
    return [
        { ok: /^https:\/\//.test(SITE_URL), label: 'The website address (VITE_SITE_URL) is set and uses https' },
        { ok: title >= 15 && title <= 60, label: 'Meta title is between 15 and 60 characters' },
        { ok: description >= 70 && description <= 160, label: 'Meta description is between 70 and 160 characters' },
        { ok: Boolean(settings.logo && settings.logo.url), label: 'A logo is uploaded' },
        { ok: Boolean(seo.googleVerification), label: 'Google verification code is saved' }
    ];
};

export default function SearchConsolePanel({ settings }) {
    const toast = useToast();
    const [copied, setCopied] = useState(false);
    const sitemap = SITE_URL ? `${SITE_URL}/sitemap.xml` : '';
    const checks = buildChecks(settings);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(sitemap);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            toast.error('Could not copy the link');
        }
    };

    return (
        <section className="p-6 mt-6 space-y-6 card">
            <div>
                <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                    <SearchCheck size={18} className="text-brand-600" />
                    {t('Show your academy on Google')}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                    {t('Connect Google Search Console so Google finds your pages faster and tells you if something is wrong.')}
                </p>
            </div>

            <ul className="grid gap-2 sm:grid-cols-2">
                {checks.map((item) => (
                    <li
                        key={item.label}
                        className={`flex items-start gap-2.5 rounded-xl px-3 py-2.5 text-sm ${item.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                            }`}
                    >
                        {item.ok ? (
                            <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                        ) : (
                            <AlertCircle size={16} className="mt-0.5 shrink-0" />
                        )}
                        {t(item.label)}
                    </li>
                ))}
            </ul>

            <ol className="grid gap-3 md:grid-cols-2">
                {STEPS.map((step, index) => (
                    <li key={step.title} className="relative p-4 border rounded-xl border-slate-200 bg-slate-50 ps-14">
                        <span className="absolute flex items-center justify-center text-xs font-bold text-white rounded-full start-4 top-4 h-7 w-7 bg-brand-600">
                            {index + 1}
                        </span>
                        <p className="text-sm font-semibold text-slate-900">{t(step.title)}</p>
                        <p className="mt-1 text-xs leading-6 text-slate-500">{t(step.text)}</p>
                    </li>
                ))}
            </ol>

            <div className="flex flex-wrap items-center gap-3">
                <a
                    href="https://search.google.com/search-console"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                >
                    <ExternalLink size={16} />
                    {t('Open Google Search Console')}
                </a>
                {sitemap && (
                    <>
                        <button type="button" className="btn-secondary" onClick={copy}>
                            {copied ? <Check size={16} /> : <Copy size={16} />}
                            {t('Copy sitemap link')}
                        </button>
                        <a href={sitemap} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-brand-600 hover:underline">
                            {t('Open sitemap')}
                        </a>
                    </>
                )}
            </div>

            <p className="text-xs leading-6 text-slate-500">
                {t('Google needs days or weeks to index a new site, and no tool can guarantee a ranking. A custom domain, a clear title and description, and real content help the most. The keywords field is ignored by Google.')}
            </p>
        </section>
    );
}