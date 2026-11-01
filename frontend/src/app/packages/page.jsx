import PageHero from '@/components/ui/PageHero';
import CtaBanner from '@/components/ui/CtaBanner';
import Reveal from '@/components/ui/Reveal';
import PackageCard from '@/components/cards/PackageCard';
import { getPackages } from '@/lib/api/packages';
import { getT } from '@/lib/serverTexts';
import { getHeadings } from '@/lib/headings';

export const revalidate = 60;

export async function generateMetadata() {
    const t = await getT();
    return { title: t('meta_packages') };
}

const LAYOUTS = {
    1: 'max-w-md',
    2: 'max-w-4xl md:grid-cols-2',
    3: 'max-w-6xl md:grid-cols-2 lg:grid-cols-3',
    4: 'max-w-7xl md:grid-cols-2 xl:grid-cols-4'
};

export default async function PackagesPage() {
    const [packages, t] = await Promise.all([getPackages(), getT()]);
    const layout = LAYOUTS[Math.min(packages.length, 4)] || LAYOUTS[4];

    return (
        <main>
            <PageHero {...getHeadings(t).packages} />

            <section className="py-16 bg-background sm:py-24">
                <div className="px-5 mx-auto max-w-7xl sm:px-8">
                    {packages.length === 0 ? (
                        <p className="text-center text-muted">{t('packages_empty')}</p>
                    ) : (
                        <div className={`mx-auto grid items-stretch gap-8 ${layout}`}>
                            {packages.map((pkg, index) => (
                                <Reveal
                                    key={pkg._id}
                                    delay={index * 0.12}
                                    className={pkg.isPopular ? 'relative z-10 lg:-my-4' : ''}
                                >
                                    <PackageCard pkg={pkg} />
                                </Reveal>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <CtaBanner
                title={t('packages_ctaTitle')}
                description={t('packages_ctaText')}
                primary={{ label: t('packages_ctaButton'), href: '/#contact' }}
            />
        </main>
    );
}