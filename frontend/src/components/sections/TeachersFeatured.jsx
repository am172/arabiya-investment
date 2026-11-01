import Image from 'next/image';
import { Award, Star } from 'lucide-react';
import Reveal from '@/components/ui/Reveal';
import SectionTitle from '@/components/ui/SectionTitle';
import { getT } from '@/lib/serverTexts';

function Avatar({ teacher, size }) {
    const url = teacher.image && teacher.image.url;
    return url ? (
        <Image src={url} alt={teacher.name} width={size} height={size} className="object-cover rounded-full" style={{ width: size, height: size }} />
    ) : (
        <span
            className="flex items-center justify-center font-bold rounded-full bg-gradient-to-br from-primary to-accent font-heading text-primary-foreground"
            style={{ width: size, height: size }}
        >
            {teacher.name.charAt(0)}
        </span>
    );
}

export default async function TeachersFeatured({ teachers, heading }) {
    if (!teachers || teachers.length === 0) return null;

    const t = await getT();
    const [lead, ...others] = teachers;
    const leadImage = lead.image && lead.image.url;

    return (
        <section id="teachers" className="relative py-20 overflow-hidden scroll-mt-20 bg-background sm:py-28">
            <div className="relative px-5 mx-auto max-w-7xl sm:px-8">
                <SectionTitle {...heading} />

                <div className="grid gap-6 mt-14 lg:grid-cols-5">
                    <Reveal className="lg:col-span-3">
                        <article className="grid h-full overflow-hidden border rounded-theme border-border bg-surface sm:grid-cols-2">
                            <div className="relative min-h-[18rem] bg-primary/10">
                                {leadImage ? (
                                    <Image
                                        src={leadImage}
                                        alt={lead.name}
                                        fill
                                        sizes="(min-width: 1024px) 28vw, 100vw"
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full font-bold bg-gradient-to-br from-primary to-accent font-heading text-7xl text-primary-foreground">
                                        {lead.name.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col justify-center gap-4 p-7 sm:p-9">
                                <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-secondary/15 px-3 py-1 text-xs font-bold text-secondary">
                                    <Star size={12} className="fill-current" />
                                    {Number(lead.rating).toFixed(1)}
                                </span>
                                <div>
                                    <h3 className="text-2xl font-extrabold">{lead.name}</h3>
                                    <p className="mt-1 text-sm font-medium text-primary">{lead.title}</p>
                                </div>
                                {lead.bio && <p className="text-sm leading-7 text-muted">{lead.bio}</p>}
                                {(lead.subjects || []).length > 0 && (
                                    <ul className="flex flex-wrap gap-2">
                                        {lead.subjects.slice(0, 4).map((subject) => (
                                            <li key={subject} className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                                                {subject}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                {lead.experienceYears > 0 && (
                                    <p className="inline-flex items-center gap-1.5 text-xs text-muted">
                                        <Award size={14} className="text-secondary" />
                                        {t('teachers_experience', { n: lead.experienceYears })}
                                    </p>
                                )}
                            </div>
                        </article>
                    </Reveal>

                    {others.length > 0 && (
                        <ul className="flex flex-col gap-4 lg:col-span-2">
                            {others.slice(0, 4).map((teacher, index) => (
                                <Reveal key={teacher._id} as="li" delay={index * 0.08} className="flex-1">
                                    <article className="flex items-center h-full gap-4 p-4 transition border rounded-theme border-border bg-surface hover:border-primary/50">
                                        <Avatar teacher={teacher} size={64} />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold truncate">{teacher.name}</h3>
                                            <p className="text-sm truncate text-muted">{teacher.title}</p>
                                            {(teacher.subjects || []).length > 0 && (
                                                <p className="mt-1 text-xs truncate text-primary">{teacher.subjects.slice(0, 3).join(' · ')}</p>
                                            )}
                                        </div>
                                        <span className="inline-flex items-center gap-1 text-sm font-semibold">
                                            <Star size={14} className="fill-amber-400 text-amber-400" />
                                            {Number(teacher.rating).toFixed(1)}
                                        </span>
                                    </article>
                                </Reveal>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </section>
    );
}