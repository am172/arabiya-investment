import { Link } from 'react-router-dom';
import { FolderInput, Plus } from 'lucide-react';
import FormInput, { FormToggle } from '../../forms/FormInput';
import FormTextarea from '../../forms/FormTextarea';
import BadgesEditor from '../BadgesEditor';
import { KindChip } from '../CatalogTree';
import { ROUTES, withId } from '../../../constants/routes';
import { t } from '../../../i18n';

export default function GeneralTab({ form, update, errors, node, trail, onMove }) {
    const isCategory = form.kind === 'category';
    const base = isCategory ? '/categories/' : '/products/';
    const bind = (name) => ({
        value: form[name],
        error: errors[name],
        onChange: (event) => update(name, event.target.value)
    });

    return (
        <div className="space-y-5">
            <section className="p-6 space-y-5 card">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                        <KindChip kind={form.kind} />
                        <span className="text-slate-400">{t('Location')}:</span>
                        <Link to={ROUTES.CATALOG} className="text-slate-600 hover:text-brand-600">
                            {t('Top level')}
                        </Link>
                        {trail.map((item) => (
                            <span key={item._id} className="flex items-center gap-2">
                                <span className="text-slate-300 rtl:rotate-180">›</span>
                                <Link to={withId(ROUTES.CATALOG_EDIT, item._id)} className="text-slate-600 hover:text-brand-600">
                                    {item.name}
                                </Link>
                            </span>
                        ))}
                    </div>
                    {node && (
                        <button type="button" className="btn-secondary px-3 py-1.5 text-xs" onClick={onMove}>
                            <FolderInput size={14} />
                            {t('Change location')}
                        </button>
                    )}
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                    <FormInput label="Name" dir="auto" maxLength={200} {...bind('name')} />
                    <FormInput label="SKU / code (optional)" dir="ltr" maxLength={60} {...bind('sku')} />
                    <FormInput
                        label="URL slug"
                        dir="ltr"
                        className="sm:col-span-2"
                        maxLength={120}
                        hint={`${base}${form.slug || t('Leave empty to generate it from the name')}${node ? ` · ${t('Changing the slug changes the page address')}` : ''
                            }`}
                        {...bind('slug')}
                    />
                    <FormTextarea
                        label="Short summary"
                        dir="auto"
                        className="sm:col-span-2"
                        rows={2}
                        maxLength={500}
                        hint={`${form.summary.length}/500 · ${t('Shown on cards and in search results')}`}
                        {...bind('summary')}
                    />
                    <FormTextarea
                        label="Full description"
                        dir="auto"
                        className="sm:col-span-2"
                        rows={10}
                        maxLength={20000}
                        hint="Plain text. A blank line starts a new paragraph."
                        {...bind('description')}
                    />
                </div>
            </section>

            <section className="p-6 space-y-4 card">
                <FormToggle
                    label="Published"
                    hint="Draft items are hidden from the website"
                    checked={form.isActive}
                    onChange={(value) => update('isActive', value)}
                />
                <FormToggle
                    label="Featured on the homepage"
                    hint="Shown in the featured products section"
                    checked={form.isFeatured}
                    onChange={(value) => update('isFeatured', value)}
                />
                <FormToggle
                    label={isCategory ? 'Allow requests for this category' : 'Allow product requests'}
                    hint="Shows the request button on the page"
                    checked={form.allowOrderRequest}
                    onChange={(value) => update('allowOrderRequest', value)}
                />
                {form.allowOrderRequest && (
                    <FormInput
                        label="Request button text"
                        dir="auto"
                        maxLength={60}
                        placeholder={t('Request product')}
                        {...bind('ctaLabel')}
                    />
                )}
            </section>

            <section className="p-6 card">
                <h3 className="text-base font-semibold text-slate-900">{t('Badges')}</h3>
                <p className="mt-1 mb-4 text-sm text-slate-500">{t('Short labels shown on the card, such as Best seller')}</p>
                <BadgesEditor items={form.badges} onChange={(value) => update('badges', value)} />
            </section>

            <section className="p-6 card">
                <FormInput
                    label="Tags"
                    dir="auto"
                    hint="Separate with commas. Used for search."
                    {...bind('tags')}
                />
            </section>

            {node && (
                <section className="p-6 card">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <h3 className="text-base font-semibold text-slate-900">{t('Inside this item')}</h3>
                        <div className="flex gap-2">
                            <Link to={`${ROUTES.CATALOG_NEW}?kind=category&parent=${node._id}`} className="btn-secondary px-3 py-1.5 text-xs">
                                <Plus size={14} />
                                {t('Add sub-category')}
                            </Link>
                            <Link to={`${ROUTES.CATALOG_NEW}?kind=product&parent=${node._id}`} className="btn-secondary px-3 py-1.5 text-xs">
                                <Plus size={14} />
                                {t('Add sub-product')}
                            </Link>
                        </div>
                    </div>
                    {node.children.length === 0 ? (
                        <p className="text-sm text-slate-400">{t('Nothing inside this item yet')}</p>
                    ) : (
                        <ul className="space-y-1.5">
                            {node.children.map((child) => (
                                <li key={child._id}>
                                    <Link
                                        to={withId(ROUTES.CATALOG_EDIT, child._id)}
                                        className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2.5 text-sm transition hover:border-brand-400"
                                    >
                                        <span className="font-medium truncate text-slate-800">{child.name}</span>
                                        <span className="flex items-center gap-2 shrink-0">
                                            {!child.isActive && (
                                                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-600">{t('Draft')}</span>
                                            )}
                                            <KindChip kind={child.kind} />
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            )}
        </div>
    );
}