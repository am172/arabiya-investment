'use client';

import Image from 'next/image';
import { Award, Star, Users } from 'lucide-react';
import TiltCard from '@/components/ui/TiltCard';
import { useT } from '@/components/providers/TextsProvider';

const MAX_SUBJECTS = 3;

export default function TeacherCard({ teacher }) {
  const t = useT();
  const subjects = teacher.subjects || [];
  const extra = subjects.length - MAX_SUBJECTS;
  const hasImage = Boolean(teacher.image && teacher.image.url);

  return (
    <TiltCard className="h-full rounded-theme" max={9}>
      <article className="relative h-full overflow-hidden border shadow-lg group/card rounded-theme border-border bg-surface shadow-primary/5">
        <div className="relative aspect-[4/5] overflow-hidden bg-primary/10">
          {hasImage ? (
            <Image
              src={teacher.image.url}
              alt={teacher.name}
              fill
              sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 30vw, (min-width: 640px) 44vw, 80vw"
              className="object-cover transition duration-700 group-hover/card:scale-110"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-6xl font-bold bg-gradient-to-br from-primary to-accent font-heading text-primary-foreground">
              {teacher.name.charAt(0)}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />

          <span className="absolute end-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-black/45 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
            <Star size={13} className="fill-amber-400 text-amber-400" />
            {Number(teacher.rating).toFixed(1)}
          </span>

          <div className="absolute inset-x-0 bottom-0 p-5">
            <h3 className="text-xl font-bold text-white">{teacher.name}</h3>
            <p className="mt-0.5 text-sm text-white/80">{teacher.title}</p>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {subjects.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {subjects.slice(0, MAX_SUBJECTS).map((subject) => (
                <li
                  key={subject}
                  className="px-3 py-1 text-xs font-medium rounded-full bg-primary/15 text-primary dark:bg-primary/20"
                >
                  {subject}
                </li>
              ))}
              {extra > 0 && (
                <li className="px-3 py-1 text-xs font-medium rounded-full bg-border/60 text-muted">
                  +{extra}
                </li>
              )}
            </ul>
          )}
          <div className="flex flex-wrap items-center pt-4 text-xs border-t gap-x-5 gap-y-2 border-border text-muted">
            {teacher.experienceYears > 0 && (
              <span className="inline-flex items-center gap-1.5">
                <Award size={14} className="text-secondary" />
                {t('teachers_experience', { n: teacher.experienceYears })}
              </span>
            )}
            {teacher.studentsCount > 0 && (
              <span className="inline-flex items-center gap-1.5">
                <Users size={14} className="text-accent" />
                {t('teachers_students', { n: teacher.studentsCount })}
              </span>
            )}
          </div>
        </div>
      </article>
    </TiltCard>
  );
}