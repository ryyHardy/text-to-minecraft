import { useState } from "react";

type InputProps = {
  label?: string;
  error?: string;
  helperText?: string;
  revealToggle?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>;

export default function Input({
  label,
  error,
  helperText,
  revealToggle = false,
  className = "",
  name,
  type,
  ...props
}: InputProps) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password" && revealToggle;

  const baseClasses = `
    w-full px-3 py-2 rounded-md border transition-all duration-200
    bg-bg-input-1 border-border-1 text-text-1 placeholder:text-text-3
    focus:outline-none focus:ring-2 focus:ring-accent-1 focus:border-accent-1
    disabled:opacity-50 disabled:cursor-not-allowed
    ${error ? "border-error-2 focus:ring-error-1" : ""}
  `;

  return (
    <section className='space-y-1'>
      {label && (
        <label
          htmlFor={name}
          className='block text-sm font-medium uppercase tracking-wide text-text-2'
        >
          {label}
        </label>
      )}
      <div className='relative'>
        <input
          name={name}
          type={isPassword ? (show ? "text" : "password") : type}
          className={`${baseClasses} ${className} ${isPassword ? "pr-10" : ""}`}
          {...props}
        />
        {isPassword && (
          <button
            type='button'
            onClick={() => setShow(s => !s)}
            className='absolute inset-y-0 right-0 px-3 text-text-3 hover:text-text-2'
            aria-label={show ? "Hide value" : "Show value"}
          >
            {show ? "Hide" : "Show"}
          </button>
        )}
      </div>

      {error && <p className='text-sm text-error-text'>{error}</p>}
      {helperText && !error && (
        <p className='text-sm text-text-3'>{helperText}</p>
      )}
    </section>
  );
}
