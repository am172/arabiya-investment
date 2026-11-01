'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Play } from 'lucide-react';
import Button from '@/components/ui/Button';
import { item } from './shared';

const isExternal = (href) => /^https?:\/\//i.test(href);

const externalProps = (href) =>
    isExternal(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {};

export default function HeroActions({ hero, onImage = false, centered = false }) {
    const primary = hero.primaryCta;
    const secondary = hero.secondaryCta;
    const showPrimary = Boolean(primary && primary.label && primary.href);
    const showSecondary = Boolean(secondary && secondary.label && secondary.href);

    if (!showPrimary && !showSecondary) return null;

    return (
        <motion.div
            variants={item}
            className={`mt-7 flex w-full flex-col gap-3 sm:mt-9 sm:w-auto sm:flex-row sm:items-center ${
                centered ? 'sm:justify-center' : ''
            }`}
        >
            {showPrimary && (
                <Button
                    href={primary.href}
                    size="lg"
                    className={`w-full sm:w-auto ${
                        onImage
                            ? '!bg-white !text-slate-900 hover:!bg-white/90'
                            : 'dark:!bg-foreground dark:!text-background dark:hover:!bg-foreground/90'
                    }`}
                    data-track="hero-primary"
                    {...externalProps(primary.href)}
                >
                    {primary.label}
                    <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
                </Button>
            )}
            {showSecondary && (
                <Button
                    href={secondary.href}
                    variant="outline"
                    size="lg"
                    className={`w-full sm:w-auto ${
                        onImage
                            ? '!border-white/40 !bg-white/10 !text-white hover:!bg-white/20'
                            : 'dark:!border-foreground/25 dark:!bg-foreground/5 dark:!text-foreground dark:hover:!bg-foreground/15'
                    }`}
                    data-track="hero-secondary"
                    {...externalProps(secondary.href)}
                >
                    <Play size={16} className="fill-current" />
                    {secondary.label}
                </Button>
            )}
        </motion.div>
    );
}