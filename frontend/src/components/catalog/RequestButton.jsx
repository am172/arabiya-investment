'use client';

import { ClipboardList } from 'lucide-react';
import { useRequest } from '@/components/providers/RequestProvider';
import { useT } from '@/components/providers/TextsProvider';

const SIZES = { md: 'px-6 py-3 text-sm', lg: 'px-8 py-4 text-base' };

const VARIANTS = {
    primary: 'bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:-translate-y-0.5',
    outline: 'border border-border bg-background text-foreground hover:border-primary hover:text-primary'
};

export default function RequestButton({
    product,
    label = '',
    variant = 'primary',
    size = 'lg',
    icon = true,
    className = ''
}) {
    const t = useT();
    const { open } = useRequest();

    if (product.allowOrderRequest === false) return null;

    return (
        <button
            type="button"
            data-track={`request:${product.slug}`}
            onClick={() =>
                open({
                    _id: product._id,
                    slug: product.slug,
                    name: product.name,
                    ctaLabel: product.ctaLabel,
                    options: product.options,
                    allowOrderRequest: product.allowOrderRequest
                })
            }
            className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30 ${SIZES[size]} ${VARIANTS[variant]} ${className}`}
        >
            {icon && <ClipboardList size={18} aria-hidden="true" />}
            {label || product.ctaLabel || t('request_cta')}
        </button>
    );
}