// src/components/ui/Badge.jsx
export default function Badge({
  children,
  variant = "default",
  size = "md",
  icon,
  dot = false,
}) {
  const variants = {
    default: "bg-gray-100 text-neutral-secondary",
    primary: "bg-primary/10 text-primary-darker",
    success: "bg-success/10 text-success-dark",
    warning: "bg-warning/10 text-warning-dark",
    danger: "bg-danger/10 text-danger-dark",
    info: "bg-info/10 text-info-dark",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${variants[variant]} ${sizes[size]}`}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current"></span>}
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
}
