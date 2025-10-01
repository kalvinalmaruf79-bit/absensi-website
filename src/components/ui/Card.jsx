// src/components/ui/Card.jsx
export default function Card({
  children,
  title,
  subtitle,
  className = "",
  headerAction,
  ...props
}) {
  return (
    <div className={`card ${className}`} {...props}>
      {(title || headerAction) && (
        <div className="card-header">
          <div>
            {title && <div className="card-title">{title}</div>}
            {subtitle && <div className="card-subtitle">{subtitle}</div>}
          </div>
          {headerAction && (
            <div className="card-header-action">{headerAction}</div>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
