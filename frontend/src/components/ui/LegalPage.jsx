import Reveal from './Reveal';
import { arabic } from '@/lib/fonts';
import { getT } from '@/lib/serverTexts';
import { formatArabicDate, parseBody, toArabicNumber } from '@/lib/legal';

function Body({ text }) {
    return parseBody(text).map((block, index) =>
        block.type === 'ul' ? (
            <ul
                key={index}
                className="mt-4 space-y-2 text-base leading-8 list-disc ps-6 text-muted marker:text-primary"
            >
                {block.items.map((entry, position) => (
                    <li key={position}>{entry}</li>
                ))}
            </ul>
        ) : (
            <p key={index} className="mt-4 text-base leading-8 text-muted sm:text-lg sm:leading-9">
                {block.text}
            </p>
        )
    );
}

export default async function LegalPage({ title, intro, sections, updatedAt }) {
    const t = await getT();
    const date = formatArabicDate(updatedAt);

    return (
        <main
            dir="rtl"
            lang="ar"
            className={`${arabic.variable} bg-background pb-20 pt-32 font-arabic sm:pb-28 sm:pt-40`}
        >
            <div className="max-w-6xl px-5 mx-auto sm:px-8">
                <Reveal className="max-w-3xl">
                    <h1 className="font-arabic text-4xl font-extrabold leading-[1.4] sm:text-5xl">{title}</h1>
                    {date && <p className="mt-4 text-sm font-medium text-muted">{t('legal_updated', { date })}</p>}
                    {intro && <p className="mt-6 text-lg leading-9 text-muted">{intro}</p>}
                </Reveal>

                {sections.length > 0 && (
                    <div className="mt-14 grid gap-12 lg:grid-cols-[16rem_1fr] lg:gap-16">
                        <nav aria-label={t('legal_tocLabel')} className="hidden lg:block">
                            <div className="sticky p-5 border top-28 rounded-theme border-border bg-surface">
                                <p className="mb-4 text-sm font-bold">{t('legal_toc')}</p>
                                <ol className="space-y-3">
                                    {sections.map((section, index) => (
                                        <li key={`${section.heading}-${index}`}>
                                            <a
                                                href={`#section-${index + 1}`}
                                                className="flex gap-2 text-sm leading-6 transition text-muted hover:text-primary"
                                            >
                                                <span className="font-semibold text-primary">{toArabicNumber(index + 1)}.</span>
                                                {section.heading}
                                            </a>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        </nav>

                        <article className="min-w-0 space-y-12">
                            {sections.map((section, index) => (
                                <Reveal key={`${section.heading}-${index}`}>
                                    <section id={`section-${index + 1}`} className="scroll-mt-28">
                                        <h2 className="font-arabic text-2xl font-bold leading-[1.5]">
                                            <span className="me-3 text-primary">{toArabicNumber(index + 1)}.</span>
                                            {section.heading}
                                        </h2>
                                        <Body text={section.body} />
                                    </section>
                                </Reveal>
                            ))}
                        </article>
                    </div>
                )}
            </div>
        </main>
    );
}