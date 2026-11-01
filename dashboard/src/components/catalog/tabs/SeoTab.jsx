import FormInput from '../../forms/FormInput';
import FormTextarea from '../../forms/FormTextarea';
import { SITE_URL } from '../../../constants/config';
import { t } from '../../../i18n';

export default function SeoTab({ form, update, errors }) {
    const base = form.kind === 'category' ? '/categories/' : '/products/';
    const title = form.seo.title || form.name || t('Page title');
    const description = form.seo.description || form.summary || t('The description appears here.');
    const host = SITE_URL ? SITE_URL.replace(/^https?:\/\//, '') : 'your-site.com';

    const setSeo = (key, value) => update('seo', (current) => ({ ...current, [key]: value }));

    return (
        <div className="space-y-5">
            <section className="p-6 card">
                <p className="label">{t('Search preview')}</p>
                <div className="p-4 border rounded-xl border-slate-200 bg-slate-50">
                    <p dir="ltr" className="text-xs truncate text-start text-slate-500">
                        {host}
                        {base}
                        {form.slug || '...'}
                    </p>
                    <p dir="auto" className="mt-1 text-lg font-medium text-blue-700 truncate">
                        {title}
                    </p>
                    <p dir="auto" className="mt-1 text-sm line-clamp-2 text-slate-600">
                        {description}
                    </p>
                </div>
            </section>

            <section className="p-6 space-y-5 card">
                <FormInput
                    label="SEO title"
                    dir="auto"
                    maxLength={120}
                    hint={`${form.seo.title.length} / 60 · ${t('Leave empty to use the item name')}`}
                    value={form.seo.title}
                    error={errors['seo.title']}
                    onChange={(event) => setSeo('title', event.target.value)}
                />
                <FormTextarea
                    label="SEO description"
                    dir="auto"
                    rows={3}
                    maxLength={320}
                    hint={`${form.seo.description.length} / 160 · ${t('Leave empty to use the short summary')}`}
                    value={form.seo.description}
                    error={errors['seo.description']}
                    onChange={(event) => setSeo('description', event.target.value)}
                />
                <FormInput
                    label="Keywords"
                    dir="auto"
                    hint="Separate with commas. Google ignores this field, so it is optional."
                    value={form.seo.keywords}
                    error={errors['seo.keywords']}
                    onChange={(event) => setSeo('keywords', event.target.value)}
                />
            </section>
        </div>
    );
}