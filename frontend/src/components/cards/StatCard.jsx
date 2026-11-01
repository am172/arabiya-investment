import {
    Award,
    BookOpen,
    Clock,
    Globe,
    GraduationCap,
    Heart,
    Smile,
    Sparkles,
    Star,
    Trophy,
    Users,
    Video
} from 'lucide-react';
import Reveal from '@/components/ui/Reveal';
import Counter from '@/components/ui/Counter';

const ICONS = {
    users: Users,
    'graduation-cap': GraduationCap,
    globe: Globe,
    heart: Heart,
    star: Star,
    video: Video,
    'book-open': BookOpen,
    award: Award,
    smile: Smile,
    trophy: Trophy,
    clock: Clock
};

export default function StatCard({ stat, index }) {
    const Icon = ICONS[stat.icon] || Sparkles;

    return (
        <Reveal delay={index * 0.1} className="h-full group">
            <div className="relative h-full overflow-hidden rounded-theme border border-border bg-background/70 p-6 text-start backdrop-blur-xl transition-all duration-500 hover:-translate-y-1.5 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/15 dark:bg-surface/50 sm:p-8">
                <div
                    aria-hidden="true"
                    className="absolute w-32 h-32 transition duration-500 rounded-full -end-10 -top-10 bg-primary/10 blur-2xl group-hover:bg-accent/25 dark:bg-primary/5"
                />
                <span className="relative flex items-center justify-center w-12 h-12 mb-6 shadow-lg rounded-2xl bg-gradient-to-bl from-primary to-accent text-primary-foreground shadow-primary/30">
                    <Icon size={22} />
                </span>
                <p className="relative text-4xl font-extrabold tracking-tight font-heading text-foreground sm:text-5xl">
                    <Counter value={stat.value} prefix={stat.prefix || ''} suffix={stat.suffix || ''} />
                </p>
                <p className="relative mt-2 text-base font-semibold text-foreground">{stat.label}</p>
                {stat.description && (
                    <p className="relative mt-1 text-sm text-muted-foreground">{stat.description}</p>
                )}
            </div>
        </Reveal>
    );
}