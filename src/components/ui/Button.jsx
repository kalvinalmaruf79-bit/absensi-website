// src/components/ui/Button.jsx
export default function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  onClick,
  type = "button",
  className = "",
  ...props
}) {
  const baseStyles =
    "rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-primary hover:bg-primary-dark text-white",
    secondary:
      "bg-white hover:bg-gray-50 text-neutral-text border border-neutral-border",
    danger: "bg-danger hover:bg-danger-dark text-white",
    ghost: "hover:bg-gray-100 text-neutral-secondary",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? <span>Loading...</span> : children}
    </button>
  );
}
