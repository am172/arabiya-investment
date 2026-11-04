import Reveal from '@/components/ui/Reveal';
import SectionTitle from '@/components/ui/SectionTitle';

export default function StoryEditorial({ data, paragraphs }) {
    return (
        <div className="relative">
            <div className="max-w-6xl px-5 mx-auto sm:px-8">
                <SectionTitle
                    align="center"
                    eyebrow={data.eyebrow}
                    title={data.title}
                    highlight={data.highlight}
                />

                <div className="flex flex-col-reverse items-start gap-8 mt-8 sm:mt-10 lg:gap-10 ltr:lg:flex-row rtl:lg:flex-row-reverse">
                    <div className="w-full max-w-md mx-auto lg:mx-0 lg:max-w-none lg:w-[42%] xl:w-[45%] shrink-0 lg:sticky lg:top-24">
                        <Reveal delay={0.1}>
                            <div className="overflow-hidden border shadow-md rounded-2xl border-primary/20 bg-secondary/5">
                                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-primary/10 bg-primary/5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-primary/80" />
                                    <span className="w-2.5 h-2.5 rounded-full bg-primary/40" />
                                    <span className="w-2.5 h-2.5 rounded-full bg-primary/20" />
                                </div>
                                <div className="relative w-full overflow-hidden aspect-video bg-secondary/10">
                                    <video
                                        src="/arabya.mp4"
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        disablePictureInPicture
                                        controlsList="nodownload nofullscreen noremoteplayback"
                                        className="object-cover w-full h-full pointer-events-none select-none"
                                    />
                                </div>
                            </div>
                        </Reveal>
                    </div>

                    <div className="flex-1 w-full space-y-5 sm:space-y-6">
                        {paragraphs.map((text, index) => (
                            <Reveal key={`${index}-${text.slice(0, 12)}`} delay={index * 0.06}>
                                <p className="border-s-4 border-primary ps-4 text-sm leading-8 text-justify text-muted sm:ps-6 sm:text-lg sm:leading-[2.2]">
                                    {text}
                                </p>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}