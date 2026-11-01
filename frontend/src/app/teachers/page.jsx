import PageHero from '@/components/ui/PageHero';
import CtaBanner from '@/components/ui/CtaBanner';
import Reveal from '@/components/ui/Reveal';
import TeacherCard from '@/components/cards/TeacherCard';
import { getTeachers } from '@/lib/api/teachers';
import { getT } from '@/lib/serverTexts';
import { getHeadings } from '@/lib/headings';

export const revalidate = 60;

export async function generateMetadata() {
    const t = await getT();
    return { title: t('meta_teachers') };
}

export default async function TeachersPage() {
    const [teachers, t] = await Promise.all([getTeachers(), getT()]);

    return (
        <main dir="rtl" lang="ar">
            <PageHero {...getHeadings(t).teachers} />

            <section className="py-16 bg-background sm:py-24">
                <div className="px-5 mx-auto max-w-7xl sm:px-8">
                    {teachers.length === 0 ? (
                        <p className="text-center text-muted">{t('teachers_empty')}</p>
                    ) : (
                        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {teachers.map((teacher, index) => (
                                <Reveal key={teacher._id} as="li" delay={(index % 4) * 0.08}>
                                    <TeacherCard teacher={teacher} />
                                </Reveal>
                            ))}
                        </ul>
                    )}
                </div>
            </section>

            <CtaBanner
                title={t('teachers_ctaTitle')}
                description={t('teachers_ctaText')}
                primary={{ label: t('teachers_ctaButton'), href: '/#contact' }}
            />
        </main>
    );
}