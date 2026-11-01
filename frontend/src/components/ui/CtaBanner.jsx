import Button from './Button';
import Reveal from './Reveal';

export default function CtaBanner({ title, description, primary, secondary }) {
    return (
        <section className="py-16 bg-background sm:py-24 dark:bg-background">
            <div className="px-5 mx-auto max-w-7xl sm:px-8">
                <Reveal>
                    <div className="relative px-6 overflow-hidden text-center shadow-2xl rounded-theme bg-gradient-to-br from-primary via-primary to-accent py-14 text-primary-foreground shadow-primary/30 sm:px-12 sm:py-20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 dark:border dark:border-white/10 dark:text-white dark:shadow-black/50">
                        <div aria-hidden="true" className="absolute w-64 h-64 rounded-full -start-16 -top-16 bg-white/10 blur-3xl dark:bg-primary/20" />
                        <div aria-hidden="true" className="absolute rounded-full -bottom-20 -end-10 h-72 w-72 bg-secondary/30 blur-3xl dark:bg-secondary/20" />
                        <div className="relative max-w-2xl mx-auto">
                            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl text-primary-foreground dark:text-white">{title}</h2>
                            <p className="mt-4 text-base text-primary-foreground/85 sm:text-lg dark:text-slate-300">{description}</p>
                            <div className="flex flex-col items-center justify-center gap-3 mt-8 sm:flex-row">
                                <Button
                                    href={primary.href}
                                    size="lg"
                                    className="w-full !bg-white !text-primary hover:!bg-white/90 dark:!bg-white dark:!text-slate-900 dark:hover:!bg-white/90 sm:w-auto"
                                    data-track={`banner:${primary.label}`}
                                >
                                    {primary.label}
                                </Button>
                                {secondary && (
                                    <Button
                                        href={secondary.href}
                                        variant="outline"
                                        size="lg"
                                        className="w-full !border-white/40 !bg-white/10 !text-white hover:!bg-white/20 dark:!border-white/20 dark:!bg-white/5 dark:!text-white dark:hover:!bg-white/10 sm:w-auto"
                                        data-track={`banner:${secondary.label}`}
                                    >
                                        {secondary.label}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}