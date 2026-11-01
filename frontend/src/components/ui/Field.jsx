export default function Field({ label, error, hint, as: Tag = 'input', className = '', children, ...props }) {
  const id = props.id || props.name;

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
      </label>
      <Tag
        id={id}
        aria-invalid={Boolean(error)}
        className={`w-full rounded-xl border bg-background/60 px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted/70 focus:border-primary focus:ring-4 focus:ring-primary/15 ${
          error ? 'border-error' : 'border-border'
        } ${Tag === 'textarea' ? 'resize-y' : ''}`}
        {...props}
      >
        {children}
      </Tag>
      {error ? (
        <p role="alert" className="mt-1.5 text-xs font-medium text-error">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>
      )}
    </div>
  );
}