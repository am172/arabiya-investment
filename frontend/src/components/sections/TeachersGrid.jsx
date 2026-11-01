import TeacherCard from '@/components/cards/TeacherCard';
import Reveal from '@/components/ui/Reveal';
import SectionTitle from '@/components/ui/SectionTitle';

export default function TeachersGrid({ teachers, heading }) {
    if (!teachers || teachers.length === 0) return null;

    return (
        <section id="teachers" className="relative py-20 overflow-hidden scroll-mt-20 bg-background sm:py-28">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -end-32 top-20 h-96 w-96 rounded-full bg-secondary/10 blur-[130px]"
            />
            <div className="relative px-5 mx-auto max-w-7xl sm:px-8">
                <SectionTitle {...heading} />
                <ul className="grid gap-5 mt-14 sm:grid-cols-2 lg:grid-cols-4">
                    {teachers.slice(0, 8).map((teacher, index) => (
                        <Reveal key={teacher._id} as="li" delay={(index % 4) * 0.08}>
                            <TeacherCard teacher={teacher} />
                        </Reveal>
                    ))}
                </ul>
            </div>
        </section>
    );
}