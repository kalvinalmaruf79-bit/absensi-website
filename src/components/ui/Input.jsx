// src/components/ui/Input.jsx
export default function Input({
  label,
  error,
  helperText,
  className = "",
  icon,
  type = "text",
  ...props
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-neutral-text mb-2">
          {label}
          {props.required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-secondary">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={`w-full px-4 py-2.5 ${icon ? "pl-10" : ""} border ${
            error
              ? "border-danger focus:ring-danger"
              : "border-neutral-border focus:ring-primary"
          } rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-danger flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-1.5 text-sm text-neutral-secondary">{helperText}</p>
      )}
    </div>
  );
}
