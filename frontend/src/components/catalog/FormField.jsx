
export const controlClass = (error) =>
    `w-full rounded-xl border bg-background px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted/60 focus:border-primary focus:ring-4 focus:ring-primary/15 disabled:opacity-60 ${error ? 'border-error focus:border-error focus:ring-error/15' : 'border-border'
    }`;

export const fieldAria = (id, error, hint) => ({
    id,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? `${id}-error` : hint ? `${id}-hint` : undefined
});

export default function FormField({
    id,
    label,
    required = false,
    requiredLabel = '',
    error,
    hint,
    group = false,
    className = '',
    children
}) {
    const mark = required ? (
        <>
            <span aria-hidden="true" className="ms-1 text-error">
                *
            </span>
            {requiredLabel && <span className="sr-only"> ({requiredLabel})</span>}
        </>
    ) : null;

    const messages = (
        <>
            {hint && !error && (
                <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted">
                    {hint}
                </p>
            )}
            {error && (
                <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs font-medium text-error">
                    {error}
                </p>
            )}
        </>
    );

    if (group) {
        return (
            <fieldset
                id={id}
                className={className}
                aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
            >
                <legend className="mb-2 text-sm font-semibold">
                    {label}
                    {mark}
                </legend>
                {children}
                {messages}
            </fieldset>
        );
    }

    return (
        <div className={className}>
            {label && (
                <label htmlFor={id} className="block mb-2 text-sm font-semibold">
                    {label}
                    {mark}
                </label>
            )}
            {children}
            {messages}
        </div>
    );
}