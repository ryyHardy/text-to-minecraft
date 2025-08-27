type HeaderProps = {
  align: "l" | "m" | "r";
  titleSize?: "sm" | "md" | "lg";
} & React.ComponentPropsWithRef<"header">;

export default function Header({
  align = "l",
  titleSize = "md",
  children,
  className = "",
  ...props
}: HeaderProps) {
  const baseClasses = "px-3 h-15 flex items-center font-bold border-b";

  const sizeClasses = {
    sm: "text-2xl",
    md: "text-3xl",
    lg: "text-4xl",
  };

  const alignmentClasses = {
    l: "justify-start",
    m: "justify-center",
    r: "justify-end",
  };

  return (
    <header
      className={`${baseClasses} ${alignmentClasses} ${className}`}
      {...props}
    >
      <h1 className={sizeClasses[titleSize]}></h1>
      {children}
    </header>
  );
}
