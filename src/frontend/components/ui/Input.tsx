type InputProps = {} & React.InputHTMLAttributes<HTMLInputElement>;

export default function Input({ type, className }: InputProps) {
  const baseClasses = "";

  return (
    <input
      type={type}
      className={`${baseClasses} ${className}`}
    />
  );
}
