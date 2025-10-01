// src/components/ui/Badge.jsx
export default function Badge({ children, variant = "default", size = "md" }) {
  const variants = {
    default: "bg-gray-100 text-neutral-secondary",
    primary: "bg-primary-light bg-opacity-10 text-primary-darker",
    success: "bg-green-100 text-green-700",
    warning: "bg-yellow-100 text-yellow-700",
    danger: "bg-red-100 text-danger",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  };

  return { children };
}
