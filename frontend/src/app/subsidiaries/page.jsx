import React from 'react';
import DotsBackground from '@/components/ui/DotsBackground';
import { getPublicSubsidiaries } from '@/lib/api/subsidiaries';

export const metadata = {
    title: 'الشركات التابعة | الشركة العربية للاستثمار',
    description: 'تعرف على مجموعة الشركات التابعة للشركة العربية للاستثمار ومجالات عملها الصناعية والإنتاجية.'
};

const HERO_BG_IMAGE = '';

export default async function SubsidiariesPage() {
    const subsidiaries = await getPublicSubsidiaries();

    return (
        <main dir="rtl" lang="ar" className="min-h-screen overflow-x-hidden bg-background">
            <section className="relative overflow-hidden border-b isolate border-border bg-surface">
                {HERO_BG_IMAGE ? (
                    <div
                        className="absolute inset-0 bg-center bg-cover -z-10 opacity-40"
                        style={{ backgroundImage: `url(${HERO_BG_IMAGE})` }}
                        aria-hidden="true"
                    />
                ) : null}

                <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
                    <DotsBackground />
                    <div className="absolute inset-0 bg-gradient-to-b from-surface via-transparent to-surface" />
                    <div className="absolute -start-24 top-1/4 h-96 w-96 rounded-full bg-accent/10 blur-[140px]" />
                    <div className="absolute -end-24 bottom-0 h-96 w-96 rounded-full bg-primary/10 blur-[140px]" />
                </div>

                <div className="relative z-10 px-5 pt-32 pb-16 mx-auto space-y-5 text-center max-w-7xl sm:px-8 sm:pt-40 sm:pb-24">
                    <h1 className="text-4xl font-medium tracking-tight md:text-6xl">
                        الشركات <span className="text-primary">التابعة</span>
                    </h1>
                    <p className="max-w-3xl mx-auto text-sm leading-loose text-muted md:text-base">
                        تنضوي تحت مظلة «الشركة العربية للاستثمار» مجموعة من الشركات المتخصصة،
                        تعمل كل منها على تحقيق الجودة والكفاءة في مجالها، وتلبية احتياجات السوق
                        بمستوى عالٍ من الاحترافية.
                    </p>
                </div>
            </section>

            {subsidiaries.length === 0 ? (
                <div className="px-5 py-20 mx-auto max-w-7xl sm:px-8">
                    <div className="p-12 text-center border rounded-theme border-border bg-surface">
                        <p className="text-base text-muted">سيتم إضافة الشركات التابعة قريبًا.</p>
                    </div>
                </div>
            ) : (
                subsidiaries.map((company, index) => {
                    const id = company._id || company.id || index;

                    const isImageRight = index % 2 === 0;
                    const blockColor = isImageRight ? 'bg-primary' : 'bg-foreground/10';
                    const blockOffset = isImageRight ? 'translate(20px, -20px)' : 'translate(-20px, -20px)';

                    return (
                        <section key={id} className="relative py-12 overflow-hidden md:py-16">
                            <div className="px-5 mx-auto max-w-7xl sm:px-8">
                                <div className="grid items-center grid-cols-1 gap-10 md:grid-cols-2 md:gap-16">
                                    <div className={`relative w-full ${isImageRight ? '' : 'md:order-2'}`}>
                                        <div
                                            className={`absolute inset-0 z-0 ${blockColor}`}
                                            style={{ transform: blockOffset }}
                                            aria-hidden="true"
                                        />
                                        <div className="relative z-10 w-full overflow-hidden aspect-square bg-surface">
                                            {company.image?.url ? (
                                                <img
                                                    src={company.image.url}
                                                    alt={company.name}
                                                    loading="lazy"
                                                    className="object-cover w-full h-full"
                                                />
                                            ) : null}
                                        </div>
                                    </div>

                                    <div className={`space-y-6 ${isImageRight ? '' : 'md:order-1'}`}>
                                        <h2 className="text-3xl font-medium md:text-4xl">{company.name}</h2>

                                        {company.description ? (
                                            <p className="text-sm leading-[2.2] text-justify whitespace-pre-line text-muted md:text-base">
                                                {company.description}
                                            </p>
                                        ) : null}

                                        {company.link ? (
                                            <a
                                                href={company.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center justify-center px-8 py-3 text-xs font-medium transition-opacity rounded-md bg-primary text-primary-foreground hover:opacity-90 md:text-sm"
                                            >
                                                تعرف على منتجاتنا
                                            </a>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        </section>
                    );
                })
            )}
        </main>
    );
}