import Image from 'next/image';
import { Quote, Star } from 'lucide-react';

export default function TestimonialCard({ testimonial, className = '', starsLabel = '{n}' }) {
    const hasAvatar = Boolean(testimonial.avatar && testimonial.avatar.url);
    const rating = Math.max(1, Math.min(5, Number(testimonial.rating) || 5));

    return (
        <figure
            className={`relative rounded-theme border border-border bg-surface p-6 shadow-sm shadow-primary/5 ${className}`}
        >
            <Quote
                aria-hidden="true"
                size={36}
                className="absolute end-5 top-5 text-primary/10"
            />

            <div role="img" aria-label={starsLabel.replace('{n}', rating)} className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        size={16}
                        aria-hidden="true"
                        className={star <= rating ? 'fill-amber-400 text-amber-400' : 'text-border'}
                    />
                ))}
            </div>

            <blockquote className="mt-4 text-sm leading-relaxed text-foreground/90">
                {testimonial.content}
            </blockquote>

            <figcaption className="flex items-center gap-3 pt-4 mt-5 border-t border-border">
                {hasAvatar ? (
                    <Image
                        src={testimonial.avatar.url}
                        alt=""
                        width={44}
                        height={44}
                        className="object-cover rounded-full h-11 w-11 shrink-0"
                    />
                ) : (
                    <span className="flex items-center justify-center text-base font-bold rounded-full h-11 w-11 shrink-0 bg-gradient-to-br from-primary to-accent font-heading text-primary-foreground">
                        {testimonial.name.charAt(0).toUpperCase()}
                    </span>
                )}
                <span className="min-w-0">
                    <span className="block text-sm font-semibold truncate">{testimonial.name}</span>
                    {testimonial.role && (
                        <span className="block text-xs truncate text-muted">{testimonial.role}</span>
                    )}
                </span>
            </figcaption>
        </figure>
    );
}