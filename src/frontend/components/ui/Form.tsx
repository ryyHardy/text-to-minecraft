type FormProps = {
  title?: string;
  description?: string;
  error?: string;
  onSubmit: (event: React.FormEvent) => void;
  children: React.ReactNode;
  className?: string;
};

export default function Form({
  title,
  description,
  error,
  onSubmit,
  children,
  className = "",
}: FormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className={`space-y-6 ${className}`}
    >
      {(title || description) && (
        <header className='space-y-2'>
          {title && (
            <h2 className='text-2xl font-bold text-center text-text-1'>
              {title}
            </h2>
          )}
          {description && (
            <p className='text-center text-text-2'>{description}</p>
          )}
        </header>
      )}

      {error && (
        <div className='p-3 rounded-md bg-error-1 border border-error-2 font-bold'>
          <p className='text-sm text-error-text'>{error}</p>
        </div>
      )}

      <section className='space-y-4'>{children}</section>
    </form>
  );
}
