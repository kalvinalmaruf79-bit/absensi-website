// src/components/ui/Card.jsx
export default function Card({
  children,
  title,
  subtitle,
  className = "",
  headerAction,
  noPadding = false,
  hover = false,
  ...props
}) {
  return (
    <div
      className={`bg-white rounded-xl shadow-soft ${
        hover ? "hover:shadow-hover transition-shadow duration-200" : ""
      } ${className}`}
      {...props}
    >
      {(title || headerAction) && (
        <div className="border-b border-neutral-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-neutral-text">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-sm text-neutral-secondary mt-1">
                  {subtitle}
                </p>
              )}
            </div>
            {headerAction && <div>{headerAction}</div>}
          </div>
        </div>
      )}
      <div className={noPadding ? "" : "p-6"}>{children}</div>
    </div>
  );
}
