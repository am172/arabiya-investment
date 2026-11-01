import Icon from '@/components/ui/Icon';

const arNum = (n) => n.toLocaleString('ar-EG').padStart(2, '٠');

export default function FeatureCard({ feature, index = 0 }) {
    return (
        <div className="relative flex flex-col justify-between w-full h-full overflow-hidden transition-all duration-500 border group rounded-theme border-border/80 bg-surface/90 p-7 backdrop-blur-xl hover:-translate-y-2 hover:border-primary/60 hover:shadow-2xl hover:shadow-primary/20 dark:border-white/10 dark:bg-surface/80 dark:hover:border-primary/60 dark:hover:bg-surface">
            <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-1 transition-transform duration-500 ease-out origin-right scale-x-0 pointer-events-none bg-gradient-to-l from-primary via-accent to-secondary group-hover:scale-x-100"
            />

            <div
                aria-hidden="true"
                className="absolute transition-all duration-500 rounded-full opacity-0 pointer-events-none -top-16 -start-16 h-44 w-44 bg-gradient-to-br from-primary/25 to-accent/20 blur-2xl group-hover:scale-125 group-hover:opacity-100 dark:from-primary/35 dark:to-accent/30"
            />

            <Icon
                name={feature.icon}
                size={140}
                className="pointer-events-none absolute -bottom-8 -end-6 text-foreground opacity-[0.03] transition-all duration-700 ease-out group-hover:-rotate-12 group-hover:scale-125 group-hover:text-primary group-hover:opacity-[0.12] dark:opacity-[0.06] dark:group-hover:opacity-[0.2]"
            />

            <div className="relative z-10 flex items-center justify-between gap-4 mb-6">
                <div className="relative flex items-center justify-center transition-all duration-500 shadow-lg h-14 w-14 shrink-0 rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-primary/30 ring-4 ring-primary/10 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-primary/50 dark:ring-white/15">
                    <Icon name={feature.icon} size={24} />
                </div>

                <span
                    aria-hidden="true"
                    className="text-3xl font-black tracking-tight transition-colors duration-500 font-heading text-foreground/20 group-hover:text-primary dark:text-white/30 dark:group-hover:text-primary"
                >
                    {/* {arNum(index + 1)} */}
                </span>
            </div>

            <div className="relative z-10 flex-1">
                <h3 className="text-xl font-extrabold transition-colors duration-300 text-foreground group-hover:text-primary dark:text-white dark:group-hover:text-primary">
                    {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed transition-colors duration-300 text-muted-foreground group-hover:text-foreground dark:text-zinc-300 dark:group-hover:text-white">
                    {feature.text}
                </p>
            </div>

            <div
                aria-hidden="true"
                className="relative z-10 flex items-center gap-2 pt-4 mt-6 border-t border-border/60 dark:border-white/15"
            >
                <span className="h-1.5 w-6 rounded-full bg-primary/50 transition-all duration-500 group-hover:w-12 group-hover:bg-primary dark:bg-primary/60 dark:group-hover:bg-primary" />
                <span className="h-1.5 w-1.5 rounded-full bg-accent/50 transition-all duration-500 group-hover:bg-accent dark:bg-accent/60 dark:group-hover:bg-accent" />
            </div>
        </div>
    );
}