'use client';

import { Check, Sparkles } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useCurrency } from '@/components/providers/CurrencyProvider';
import { useT } from '@/components/providers/TextsProvider';
import { useContactStore } from '@/store/useContactStore';
import { formatMoney } from '@/lib/utils/currency';

const isContactLink = (link) =>
    !link || link === '/contact' || link === '#contact' || link === '/#contact';

const usePackageView = (pkg) => {
    const t = useT();
    const { priceFor } = useCurrency();
    const setSelectedPackage = useContactStore((state) => state.setSelectedPackage);
    const { price, discountPrice, currency, approx } = priceFor(pkg);
    const hasDiscount = discountPrice !== null && discountPrice !== undefined && discountPrice < price;
    const popular = Boolean(pkg.isPopular);
    const toContact = isContactLink(pkg.ctaLink);

    return {
        t,
        popular,
        approx,
        hasDiscount,
        currency,
        price,
        current: hasDiscount ? discountPrice : price,
        period: t(`packages_period_${String(pkg.billingPeriod).replace('-', '')}`),
        badge: pkg.badge || (popular ? t('packages_popular') : ''),
        cta: (
            <Button
                href={toContact ? '/#contact' : pkg.ctaLink}
                variant={popular ? 'primary' : 'outline'}
                size="lg"
                className="w-full md:w-auto"
                data-track={`package:${pkg.name}`}
                onClick={toContact ? () => setSelectedPackage(pkg.name) : undefined}
            >
                {pkg.ctaLabel || t('packages_cta')}
            </Button>
        )
    };
};

function Price({ view, className = 'text-3xl' }) {
    return (
        <div>
            <p className={`font-heading font-extrabold tracking-tight ${className}`}>
                {view.approx && <span title={view.t('currency_approx')}>≈ </span>}
                {formatMoney(view.current, view.currency)}
                {view.period && <span className="ms-1.5 text-sm font-medium text-muted">{view.period}</span>}
            </p>
            {view.hasDiscount && (
                <p className="mt-0.5 text-sm text-muted line-through">{formatMoney(view.price, view.currency)}</p>
            )}
        </div>
    );
}

export function PackageRow({ pkg }) {
    const view = usePackageView(pkg);

    return (
        <article
            className={`flex flex-col gap-5 rounded-theme border p-6 md:flex-row md:items-center md:gap-8 ${view.popular ? 'border-primary bg-primary/5 shadow-xl shadow-primary/10' : 'border-border bg-surface'
                }`}
        >
            <div className="md:w-1/4">
                {view.badge && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 mb-2 text-xs font-bold rounded-full bg-primary text-primary-foreground">
                        {view.popular && <Sparkles size={12} />}
                        {view.badge}
                    </span>
                )}
                <h3 className="text-xl font-bold">{pkg.name}</h3>
                {pkg.description && <p className="mt-1 text-sm leading-6 text-muted">{pkg.description}</p>}
            </div>

            <ul className="grid flex-1 gap-2 text-sm sm:grid-cols-2">
                {(pkg.features || []).slice(0, 6).map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                        <Check size={16} className="mt-0.5 shrink-0 text-success" />
                        {feature}
                    </li>
                ))}
            </ul>

            <div className="flex items-center justify-between gap-5 md:flex-col md:items-end">
                <Price view={view} />
                {view.cta}
            </div>
        </article>
    );
}

export function PackageMinimal({ pkg }) {
    const view = usePackageView(pkg);

    return (
        <article
            className={`flex h-full flex-col rounded-theme bg-background p-7 ${view.popular ? 'border-2 border-primary' : 'border border-border'
                }`}
        >
            <p className="h-5 text-xs font-bold tracking-wide uppercase text-primary">{view.badge}</p>
            <h3 className="mt-2 text-xl font-bold">{pkg.name}</h3>
            <div className="mt-4">
                <Price view={view} className="text-4xl" />
            </div>
            {pkg.description && <p className="mt-4 text-sm leading-6 text-muted">{pkg.description}</p>}
            <ul className="my-6 flex-1 space-y-2.5 border-t border-border pt-6 text-sm">
                {(pkg.features || []).map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        {feature}
                    </li>
                ))}
            </ul>
            <div className="[&>a]:w-full">{view.cta}</div>
        </article>
    );
}